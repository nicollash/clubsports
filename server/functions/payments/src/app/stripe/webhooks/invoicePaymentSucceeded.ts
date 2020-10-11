import mysql from 'promise-mysql';
import { sendEmail, getDbParams } from '../../../services/aws-utils';
import { getPaymentPlans } from '../../products/activeProducts.js';
import { stripe } from '../common/common';
import * as Stripe from 'stripe';
import { buildInsertQuery } from '../../../services/utils';

export const invoicePaymentSucceededOrFailed = async (event: any) => {
  console.log('Processing invoice webhook.');
  const [toParams, fromParams] = await getDbParams();

  const toConn = await mysql.createConnection(toParams.db);

  console.log('Connected to DB');

  const stripeConnectAcc = event.account
    ? { stripeAccount: event.account }
    : undefined;

  const subscription = await getSubscription(event, stripeConnectAcc);
  const charge = await getCharge(event, stripeConnectAcc);
  const discount = getDiscount(subscription);

  const {
    reg_type,
    reg_response_id,
    sku_id,
    payment_plan_id,
    promo_code,
  } = subscription.metadata;
  console.log(
    `Registration type: ${reg_type}. Reg_response_id: ${reg_response_id}. Sku_id: ${sku_id}. Payment_plan_id: ${payment_plan_id}`
  );
  if (!reg_type || !reg_response_id || !sku_id || !payment_plan_id) {
    throw new Error(
      'Unable to process the webhook without subscription metadata parameters.'
    );
  }

  const paymentPlan = await getPaymentPlan(sku_id, payment_plan_id, promo_code);

  const tableName = getTableName(reg_type);

  const paidRatio =
    +event.data.object.amount_due !== 0
      ? +event.data.object.amount_paid / +event.data.object.amount_due
      : 0;

  for (const lineItem of event.data.object.lines.data) {
    if (
      +lineItem.price.unit_amount === 0 &&
      lineItem.price.metadata?.externalId
    )
      continue; // Skip line items with zero price

    if (event.type === 'invoice.payment_succeeded') {
      const itemDiscountAmount =
        Math.round(+lineItem.amount * (discount / 100) * paidRatio) / 100;
      const itemNetAmount =
        Math.round(+lineItem.amount * paidRatio) / 100 - itemDiscountAmount;
      const itemTax =
        Math.round(
          +lineItem.tax_amounts.reduce(
            (a: number, x: any) => a + +x.amount,
            0
          ) * paidRatio
        ) / 100;
      const itemGrossAmount = itemNetAmount + itemTax;

      const balanceTransaction = charge?.balance_transaction as Stripe.Stripe.BalanceTransaction;
      const itemFees = balanceTransaction?.fee
        ? (event.data.object.amount_paid
            ? (balanceTransaction.fee * itemGrossAmount * 100) /
              +event.data.object.amount_paid
            : 0) / 100
        : 0; // When a payment is for multiple items allocate the application fee proportionally

      const itemGrossAmountLessFees = itemGrossAmount - itemFees; // This is what Stripe shows as Net Amount for a processed payment

      const newPaymentDate = new Date(
        +event.data.object.status_transitions.paid_at * 1000
      );

      // If registration response does not exist in the target database then create one
      await copyDataToPrivateDbIfNotExists({
        fromParams,
        toParams,
        tableName,
        event,
        paymentPlan,
        discount,
        lineItem,
        newPaymentDate,
        toConn,
        subscription,
      });

      await toConn.query(
        `update ${toParams.db.database}.${tableName} set payment_amount=payment_amount+?, amount_net=amount_net+?, amount_fees=amount_fees+?, amount_tax=amount_tax+?,
       payment_date=?,ext_payment_id=? where reg_response_id=?`,
        [
          itemGrossAmount,
          itemGrossAmountLessFees,
          itemFees,
          itemTax,
          newPaymentDate,
          event.data.object.id,
          reg_response_id,
        ]
      );

      let availableForAllocation = await findScheduledPaymentToAllocateTo(
        toConn,
        toParams,
        reg_response_id
      );

      if (availableForAllocation) {
        console.log(`Allocating to: ${JSON.stringify(availableForAllocation)}`);
        await toConn.query(
          `update ${toParams.db.database}.registrations_payments set amount_paid=amount_paid+?, amount_fees=amount_fees+?, amount_tax=amount_tax+?, amount_net=amount_net+?,
       payment_date=?,ext_payment_system=?, ext_payment_id=?, payment_status=?, payment_details=? where reg_payment_id=?`,
          [
            itemGrossAmount,
            itemFees,
            itemTax,
            itemGrossAmountLessFees,
            newPaymentDate,
            'stripe',
            event.data.object.id,
            'paid',
            JSON.stringify(event),
            availableForAllocation.reg_payment_id,
          ]
        );
      } else {
        console.log('Unable to allocate the payment');
      }
      console.log(
        `Successfully processed. Registration data copied to main database`
      );
    } else if (event.type === 'invoice.payment_failed') {
      console.logError(
        new Error(`Payment Failure Event: ${JSON.stringify(event)}`)
      );
      let availableForAllocation = await findScheduledPaymentToAllocateTo(
        toConn,
        toParams,
        reg_response_id
      );

      if (availableForAllocation) {
        console.log(
          `Allocating failed payment to: ${JSON.stringify(
            availableForAllocation
          )}`
        );
        await toConn.query(
          `update ${toParams.db.database}.registrations_payments 
       set payment_date=?,ext_payment_system=?, ext_payment_id=?, payment_status=?, payment_details=? where reg_payment_id=?`,
          [
            new Date(+event.data.object.status_transitions.finalized_at * 1000),
            'stripe',
            event.data.object.id,
            'failed',
            JSON.stringify(event),
            availableForAllocation.reg_payment_id,
          ]
        );
      } else {
        console.log('Unable to allocate a failed payment');
      }
    }
  }
  await toConn.end();
};

const getTableName = (reg_type: string) => {
  return reg_type === 'team'
    ? 'registrations_responses_teams'
    : 'registrations_responses_individuals';
};

const getDiscount = (subscription: Stripe.Stripe.Subscription) => {
  return subscription.metadata.promo_code_discount
    ? +subscription.metadata.promo_code_discount
    : 0;
};

const getCharge = async (
  event: any,
  stripeConnectAcc: { stripeAccount: any } | undefined
) => {
  let charge;
  if (event.data.object.charge) {
    charge = await stripe.charges.retrieve(
      event.data.object.charge,
      {
        expand: ['balance_transaction'],
      },
      stripeConnectAcc
    );
  } else {
    if (event.data.object.amount_paid !== 0) {
      throw new Error('Charge is empty while amount_paid is not zero.');
    }
  }
  return charge;
};

const getSubscription = async (
  event: any,
  stripeConnectAcc: { stripeAccount: any } | undefined
) => {
  return await stripe.subscriptions.retrieve(
    event.data.object.subscription,
    stripeConnectAcc
  );
};

const sendWelcomeEmail = async (data: any) => {
  return sendEmail(data);
};

const findScheduledPaymentToAllocateTo = async (
  toConn: mysql.Connection,
  toParams: any,
  reg_response_id: string
) => {
  let dbPayments;
  dbPayments = await toConn.query(
    `select * from ${toParams.db.database}.registrations_payments where reg_response_id=?`,
    [reg_response_id]
  );

  console.log(
    `Scheduled payments: ${JSON.stringify(
      dbPayments
    )}. Attempting to allocate the payment to a scheduled one`
  );
  const availableForAllocation = dbPayments.reduce((a: any, c: any) => {
    if (+c.amount_due - +c.amount_paid > 0 || +c.amount_due === 0) {
      if (!a || new Date(a.payment_date) > new Date(c.payment_date)) {
        return c;
      } else {
        return a;
      }
    } else {
      return a;
    }
  }, null);
  return availableForAllocation;
};

interface CopyDataParams {
  event: any;
  subscription: Stripe.Stripe.Subscription;
  paymentPlan: any;
  lineItem: any;
  discount: number;
  newPaymentDate: Date;
  fromParams: any;
  toParams: any;
  tableName: string;
  toConn: mysql.Connection;
}

const copyDataToPrivateDbIfNotExists = async ({
  fromParams,
  toParams,
  tableName,
  event,
  paymentPlan,
  discount,
  lineItem,
  newPaymentDate,
  toConn,
  subscription,
}: CopyDataParams) => {
  const { reg_response_id, owner_id } = subscription.metadata;
  const dbResponses = await toConn.query(
    `select * from ${toParams.db.database}.${tableName} where reg_response_id=?`,
    [reg_response_id]
  );

  let dbPayments = await toConn.query(
    `select * from ${toParams.db.database}.registrations_payments where reg_response_id=?`,
    [reg_response_id]
  );

  if (dbResponses.length === 0) {
    const fromConn = await mysql.createConnection(fromParams.db);
    const reg_response = (
      await fromConn.query(
        `select * from ${fromParams.db.database}.${tableName} where reg_response_id=?`,
        [reg_response_id]
      )
    )[0];
    const reg_response_custom = await fromConn.query(
      `select * from ${fromParams.db.database}.registrant_data_response where reg_response_id=?`,
      [reg_response_id]
    );
    const registration = (
      await fromConn.query(
        `select * from ${fromParams.db.database}.v_registrations where registration_id=?`,
        [reg_response.registration_id]
      )
    )[0];
    const event_master = (
      await fromConn.query(
        `select * from ${fromParams.db.database}.v_events where event_id=?`,
        [registration.event_id]
      )
    )[0];
    await fromConn.end();

    // Add Stripe stuff here
    reg_response.ext_payment_system = 'stripe';
    reg_response.ext_payment_id = event.data.object.id;
    reg_response.currency = event.data.object.currency.toUpperCase();
    reg_response.amount_due =
      Math.round(
        paymentPlan.total_price *
          // (1 - discount / 100) *
          (1 + lineItem.price.metadata.sales_tax_rate / 100) *
          100
      ) / 100;
    reg_response.payment_amount = 0;
    reg_response.payment_date = newPaymentDate;
    reg_response.created_by = owner_id;

    let { sql, params } = buildInsertQuery(
      reg_response,
      `${toParams.db.database}.${tableName}`
    );
    console.log(`Sql: ${sql}. Params: ${params}`);
    await toConn.query(sql, params);

    for (const row of reg_response_custom) {
      delete row.response_id;
      let { sql, params } = buildInsertQuery(
        row,
        `${toParams.db.database}.registrant_data_response`
      );
      console.log(`Sql: ${sql}. Params: ${params}`);
      await toConn.query(sql, params);
    }

    await sendWelcomeEmail({
      reg_response,
      paymentPlan,
      subscription,
      registration,
      paymentSuccessEvent: event,
      event: event_master,
    });
  }

  // If there is no payment schedule in the database create one
  if (dbPayments.length === 0) {
    const sql = `INSERT INTO ${toParams.db.database}.registrations_payments 
  (reg_response_id, installment_id, payment_date, payment_status, currency, amount_due, is_active_YN, created_by)
  VALUES (?, ?, ?, 'scheduled', ?, ?, 1, ?)`;
    let params = [];
    if (paymentPlan.type === 'schedule') {
      params = paymentPlan.schedule.map((phase: any) => [
        reg_response_id,
        phase.price_external_id,
        phase.date === 'now' ? new Date() : new Date(+phase.date * 1000),
        paymentPlan.currency,
        Math.round(
          phase.amount *
            // (1 - discount / 100) *
            (1 + paymentPlan.sales_tax_rate / 100) *
            100
        ) / 100,
        owner_id,
      ]);
    } else if (paymentPlan.type === 'installment') {
      let installmentDates = [];
      for (let i = 0; i < paymentPlan.iterations; i++) {
        const now = new Date();
        if (paymentPlan.interval === 'month') {
          installmentDates.push(
            new Date(
              now.setMonth(now.getMonth() + i * +paymentPlan.intervalCount)
            )
          );
        } else if (paymentPlan.interval === 'day') {
          installmentDates.push(
            new Date(
              now.setDate(now.getDate() + i * +paymentPlan.intervalCount)
            )
          );
        } else if (paymentPlan.interval === 'week') {
          installmentDates.push(
            new Date(
              now.setDate(now.getDate() + 7 * i * +paymentPlan.intervalCount)
            )
          );
        }
      }
      params = installmentDates.map(date => [
        reg_response_id,
        paymentPlan.payment_plan_id,
        date,
        paymentPlan.currency,
        Math.round(
          paymentPlan.price *
            // (1 - discount / 100) *
            (1 + paymentPlan.sales_tax_rate / 100) *
            100
        ) / 100,
        owner_id,
      ]);
    }

    console.log(`Sql: ${sql}. Params: ${params}`);
    for (let param of params) {
      const res = await toConn.query(sql, param);
      console.log(res);
    }
  }
};

const getPaymentPlan = async (
  sku_id: string,
  payment_plan_id: string,
  discount_code: string
) => {
  const paymentPlan = (
    await getPaymentPlans({ sku_id, payment_plan_id, discount_code })
  )[0];
  console.log('paymentPlan', paymentPlan);
  return paymentPlan;
};
