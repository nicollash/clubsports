import '../../../services/logger';
import mysql from 'promise-mysql';
import { getDbParams } from '../../../services/aws-utils';
import { stripe } from '../common/common';

export const chargeRefunded = async (event: any) => {
  let toConn: mysql.Connection | null = null;

  try {
    console.log('Processing chargeRefunded webhook.');
    const toParams = (await getDbParams())[0];
    console.log('Obtained DB parameters');

    toConn = await mysql.createConnection(toParams.db);

    console.log('Connected to DB');

    const stripeConnectAcc = event.account
      ? { stripeAccount: event.account }
      : undefined;

    const invoice = await stripe.invoices.retrieve(
      event.data.object.invoice,
      stripeConnectAcc
    );
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string,
      stripeConnectAcc
    );

    const {
      reg_type,
      reg_response_id,
      sku_id,
      payment_plan_id,
    } = subscription.metadata;
    console.log(
      `Registration type: ${reg_type}. Reg_response_id: ${reg_response_id}. Sku_id: ${sku_id}. Payment_plan_id: ${payment_plan_id}`
    );
    if (!reg_type || !reg_response_id || !sku_id || !payment_plan_id) {
      throw new Error(
        'Unable to process the webhook without subscription metadata parameters.'
      );
    }

    const tableName = getTableName(reg_type);

    const payments = await toConn.query(
      `select * from ${toParams.db.database}.registrations_payments
    where reg_response_id = ? and ext_payment_id = ? and is_active_YN = 1`,
      [reg_response_id, invoice.id]
    );

    if (!payments || payments.length === 0) {
      throw new Error(
        `Matching payment not found. Payments: ${JSON.stringify(payments)}`
      );
    } else if (payments.length > 1) {
      console.log(
        `Payments: ${JSON.stringify(
          payments.map((p: any) => p.reg_payment_id)
        )}`
      );
      console.logError(
        new Error(`Unexpected number of matching payments. Using the first one`)
      );
    }
    const payment = payments[0];
    console.log(`Applying refund to payment: '${payment.reg_payment_id}'`);

    const amountRefunded = event.data.object.amount_refunded / 100;

    const deltaAmountPaid =
      event.data.object.amount / 100 - payment.amount_paid;
    if (deltaAmountPaid !== 0) {
      console.logError(
        new Error(
          `Unexpected amount_paid in DB: ${payment.amount_paid}. Stripe: ${
            event.data.object.amount / 100
          }`
        )
      );
    }

    const deltaAmountRefunded = amountRefunded - payment.amount_refunded;
    if (deltaAmountRefunded === 0) {
      console.logError(
        new Error(
          `Amount refunded is the same as already recorded in the DB. Possible duplicate webhook call`
        )
      );
    }

    const deltaAmountTax =
      payment.amount_paid !== payment.amount_refunded
        ? Math.round(
            (payment.amount_tax /
              (payment.amount_paid - payment.amount_refunded)) *
              deltaAmountRefunded *
              100
          ) / 100
        : payment.amount_tax;

    let status = 'refunded';
    if (event.data.object.amount / 100 > amountRefunded) {
      status = 'partially refunded';
    }

    console.log(`Updating ${tableName}`);
    await toConn.query(
      `update ${toParams.db.database}.${tableName} set payment_amount=payment_amount-?, amount_net=amount_net-?, amount_tax=amount_tax-?, payment_date=? where reg_response_id=?`,
      [
        deltaAmountRefunded,
        deltaAmountRefunded,
        deltaAmountTax,
        new Date(event.data.object.created * 1000),
        reg_response_id,
      ]
    );

    console.log(`Updating registrations_payments`);
    await toConn.query(
      `update ${toParams.db.database}.registrations_payments set amount_net=amount_net-?, amount_tax=amount_tax-?,
          amount_refunded=?, payment_date=?, payment_status=?, payment_details=? where reg_payment_id=?`,
      [
        deltaAmountRefunded,
        deltaAmountTax,
        amountRefunded,
        new Date(event.data.object.created * 1000),
        status,
        JSON.stringify(event),
        payment.reg_payment_id,
      ]
    );

    console.log(`Payment information updated`);
  } catch (err) {
    throw err;
  } finally {
    if (toConn) {
      await toConn.end();
    }
  }
};

const getTableName = (reg_type: string) => {
  return reg_type === 'team'
    ? 'registrations_responses_teams'
    : 'registrations_responses_individuals';
};
