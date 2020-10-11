import * as Stripe from 'stripe';
import {
  getPaymentPlans,
  getPromoCodes,
} from '../../products/activeProducts.js';
import {
  loadAll,
  stripe,
  SubData,
  IStripeConnectAccount,
  SubItem,
  RegType,
  CustomerData,
} from '../common/common';

const createOrUpdateCustomer = async (
  subData: SubData,
  currency: string,
  stripeAccount: IStripeConnectAccount
) => {
  const customerData = {
    ...subData.customer,
    metadata: {
      reg_type: subData.reg_type,
      reg_response_id: subData.items[0].reg_response_id,
    },
  };
  console.log(`Customer Data: ${JSON.stringify(customerData)}`);

  let customer;
  const customersList = await stripe.customers.list(
    {
      email: customerData.email,
      limit: 100,
    },
    stripeAccount
  );

  console.log(
    `Customers with email ${customerData.email}: ${JSON.stringify(
      customersList.data
    )}. Currency: ${currency}`
  );
  const customers = customersList?.data?.filter(
    customer =>
      !customer.currency ||
      customer.currency.toLowerCase() === currency.toLowerCase()
  );
  console.log(`Customers filtered by currency: ${JSON.stringify(customers)}`);

  if (customers?.length > 0) {
    customer = await stripe.customers.update(
      customers[0].id,
      customerData,
      stripeAccount
    );
    console.log(`Stripe Customer ${customer.id} updated`);
  } else {
    customer = await stripe.customers.create(customerData, stripeAccount);
    console.log(`Stripe Customer ${customer.id} created`);
  }

  await attachPaymentMethod(customer, subData, stripeAccount);

  return customer;
};

const attachPaymentMethod = async (
  customer: Stripe.Stripe.Customer,
  subData: SubData,
  stripeAccount: IStripeConnectAccount
) => {
  const paymentMethod = await stripe.paymentMethods.attach(
    subData.paymentMethodId,
    {
      customer: customer.id,
    },
    stripeAccount
  );

  console.log(
    `Stripe PaymentMethod ${paymentMethod.id} attached to customer ${customer.id}`
  );

  await stripe.customers.update(
    customer.id,
    {
      invoice_settings: {
        default_payment_method: subData.paymentMethodId,
      },
    },
    stripeAccount
  );

  console.log(
    `Stripe PaymentMethod ${paymentMethod.id} set as default customer`
  );
  return paymentMethod;
};

const validateSubscriptionData = (subData: any) => {
  if (subData.reg_type !== 'individual' && subData.reg_type !== 'team') {
    throw new Error('Reg_type must be "individual" or "team"');
  }
  if (
    !(subData.reg_response_id || subData.items[0].reg_response_id) ||
    !subData.registration_id
  ) {
    throw new Error('Registration data was not saved');
  }
  if (!subData.customer?.name || !subData.customer?.email) {
    throw new Error('Customer data was not saved');
  }
  if (!subData.items || !Array.isArray(subData.items)) {
    throw new Error('Product data was not provided');
  }
  if (!subData.paymentMethodId) {
    throw new Error('Payment method was not provided');
  }
  for (let item of subData.items) {
    if (
      !item.sku_id ||
      !item.payment_plan_id ||
      !item.quantity ||
      !(item.reg_response_id || subData.reg_response_id)
    ) {
      throw new Error('Incorrect product data provided');
    }
  }
};

const validatePrice = async (price: any) => {
  if (price.unit_amount > Number(process.env.MAX_PAYMENT_AMOUNT) * 100) {
    console.error(
      `Payment amount ${
        price.unit_amount / 100
      } is higher than MAX_PAYMENT_AMOUNT=${process.env.MAX_PAYMENT_AMOUNT}`
    );
    throw new Error(
      `Payment amount ${
        price.unit_amount / 100
      } cannot be processed online. Please contact the event organizer.`
    );
  }
};

const getPrice = async ({
  sku_id,
  payment_plan_id,
  stripe_connect_id,
}: {
  sku_id: string;
  payment_plan_id: string;
  stripe_connect_id: string;
}) => {
  const requestParams =
    stripe_connect_id === 'main'
      ? undefined
      : { stripeAccount: stripe_connect_id };
  const prices = (
    await stripe.prices.list({ product: sku_id, active: true }, requestParams)
  ).data;
  console.log(`Prices of sku ${sku_id}`, prices);
  const price = prices.find(x => x.metadata.externalId === payment_plan_id);
  console.log(`Price of ${payment_plan_id}:`, price);
  await validatePrice(price);

  return price;
};

const getRequestParams = (paymentPlan: any): IStripeConnectAccount => {
  return paymentPlan.stripe_connect_id === 'main'
    ? undefined
    : { stripeAccount: paymentPlan.stripe_connect_id };
};

export const createSubscription = async (subData: SubData) => {
  console.log(`SubData: ${JSON.stringify(subData)}`);

  validateSubscriptionData(subData);

  // For performance reasons we assume the same tax, discount_code, currency
  // and Stripe Connect Account Id for all items.
  // This information is extracted from the first line item
  const { sku_id, payment_plan_id, discount_code } = subData.items[0];

  const paymentPlan = await getPaymentPlan(
    sku_id,
    payment_plan_id,
    discount_code
  );

  const stripeAccount: IStripeConnectAccount = getRequestParams(paymentPlan);

  const customerPromise = createOrUpdateCustomer(
    subData,
    paymentPlan.currency,
    stripeAccount
  );

  const salesTaxRatePromise = getSalesTaxRate(paymentPlan, stripeAccount);

  const couponPromise = getCoupon(discount_code, paymentPlan, stripeAccount);

  const [salesTaxRate, coupon, customer] = await Promise.all([
    salesTaxRatePromise,
    couponPromise,
    customerPromise,
  ]);

  let results = await Promise.allSettled(
    subData.items.map(subItem => {
      return createSubForItem(
        subItem,
        subData.reg_type,
        customer,
        coupon,
        salesTaxRate,
        stripeAccount
      );
    })
  );

  results = results.map((result, index) =>
    result.status === 'fulfilled'
      ? {
          ...subData.items[index],
          ...result,
        }
      : {
          ...subData.items[index],
          status: result.status,
          reason: result.reason?.message,
        }
  );

  return results;
};

const createSubForItem = async (
  subItem: SubItem,
  reg_type: RegType,
  customer: Stripe.Stripe.Customer,
  coupon: Stripe.Stripe.Coupon | null,
  salesTaxRate: Stripe.Stripe.TaxRate | null,
  stripeAccount: IStripeConnectAccount
) => {
  try {
    const { sku_id, payment_plan_id, discount_code } = subItem;

    const paymentPlan = await getPaymentPlan(
      sku_id,
      payment_plan_id,
      discount_code
    );

    const phases = await getPhases(
      paymentPlan,
      subItem,
      coupon,
      salesTaxRate,
      stripeAccount
    );

    const subScheduleData: Stripe.Stripe.SubscriptionScheduleCreateParams = {
      customer: customer.id,
      start_date: 'now',
      end_behavior: 'cancel',
      phases: phases,
      metadata: {
        reg_type: reg_type,
        reg_response_id: subItem.reg_response_id,
        owner_id: paymentPlan.owner_id,
        event_id: paymentPlan.event_id,
        division_id: paymentPlan.division_id,
        sku_id: paymentPlan.sku_id,
        payment_plan_id: paymentPlan.payment_plan_id,
        promo_code: subItem.discount_code || '',
        promo_code_discount: coupon ? coupon.percent_off : 0,
        coupon: coupon ? coupon?.id : '',
      },
      expand: ['subscription.latest_invoice.payment_intent'],
    };

    const schedule = await stripe.subscriptionSchedules.create(
      { ...subScheduleData, expand: ['subscription.latest_invoice'] },
      stripeAccount
    );

    console.log(
      `Stripe Schedule ${schedule.id} created. Schedule: ${JSON.stringify(
        schedule
      )}`
    );

    let subscription = schedule.subscription as Stripe.Stripe.Subscription;
    let invoice = subscription.latest_invoice as Stripe.Stripe.Invoice;

    const updateSubscriptionPromise = stripe.subscriptions
      .update(
        subscription.id,
        {
          pending_invoice_item_interval: { interval: 'day', interval_count: 1 },
          metadata: { ...subScheduleData.metadata },
        },
        stripeAccount
      )
      .then(() => {
        console.log(`Stripe Subscription ${subscription.id} added metadata`);
      });

    // Wait for updates to complete
    await Promise.all([updateSubscriptionPromise]);

    // Test error
    if (subItem.payment_plan_id === 'div_786L5B59_FP') {
      console.log('Timeout started');
      await new Promise(resolve => setTimeout(resolve, 100000));
      // throw new Error('Test Error');
    }

    invoice = await stripe.invoices
      .pay(
        invoice.id,
        { expand: ['subscription.latest_invoice.payment_intent'] },
        stripeAccount
      )
      .then(invoice => {
        console.log(
          `Invoice ${invoice.id} attempted payment: ${JSON.stringify(invoice)}`
        );
        return invoice;
      });

    subscription = invoice.subscription as Stripe.Stripe.Subscription;

    return subscription;
  } catch (err) {
    console.logError(err);
    throw err;
  }
};

async function getPhases(
  paymentPlan: any,
  subItem: SubItem,
  coupon: Stripe.Stripe.Coupon | null,
  salesTaxRate: Stripe.Stripe.TaxRate | null,
  stripeAccount: IStripeConnectAccount
) {
  let phases: Stripe.Stripe.SubscriptionScheduleCreateParams.Phase[] = [];
  if (paymentPlan.type === 'installment') {
    const price = await getPrice(paymentPlan);

    phases.push({
      plans: [{ price: price!.id, quantity: subItem.quantity }],
      iterations: paymentPlan.iterations,
      proration_behavior: 'none',
      application_fee_percent:
        paymentPlan.stripe_connect_id !== 'main'
          ? paymentPlan.application_fee_percent.toFixed(2)
          : undefined,
      coupon: coupon?.id,
      default_tax_rates: salesTaxRate ? [salesTaxRate.id] : [],
    });
  } else if (paymentPlan.type === 'schedule') {
    const paymentSchedule = paymentPlan.schedule;

    // Find a special price for payment schedule phases (generated by SyncProducts)
    const paymentSchedulePrice = (
      await stripe.prices.list(
        {
          product: `sched_${paymentPlan.currency.toLowerCase()}_${
            paymentPlan.stripe_connect_id
          }`,
          active: true,
        },
        stripeAccount
      )
    ).data[0];

    phases = await Promise.all(
      paymentSchedule.map(async (paymentScheduleItem: any, i: number) => {
        const price = await getPrice({
          sku_id: paymentPlan.sku_id,
          payment_plan_id: paymentScheduleItem.price_external_id,
          stripe_connect_id: paymentPlan.stripe_connect_id,
        });

        let add_invoice_items;
        if (coupon) {
          add_invoice_items = [
            {
              // price_data: {
              //   currency: price.currency,
              //   product: price.product,
              //   unit_amount: Math.round(
              //     price.unit_amount // * (1 - coupon.percent_off / 100)
              //   ),
              // },
              price: price!.id,
              quantity: subItem.quantity,
            },
          ];
        } else {
          add_invoice_items = [
            {
              price: price!.id,
              quantity: subItem.quantity,
            },
          ];
        }

        const t = {
          plans: [{ price: paymentSchedulePrice.id, quantity: 0 }],
          add_invoice_items,
          billing_thresholds: {
            amount_gte: 50,
            reset_billing_cycle_anchor: true,
          },
          end_date: Math.round(
            i < paymentSchedule.length - 1
              ? +paymentSchedule[i + 1].date // end_date = start_date of the next installment
              : paymentScheduleItem.date === 'now'
              ? new Date().getTime() / 1000 + 60 * 60 * 24 // if the last and only installment end_date = now + 1 day
              : +paymentScheduleItem.date + 60 * 60 * 24 // if the last installment end_date = phase.date + 1 day
          ),
          proration_behavior: 'none',
          application_fee_percent:
            paymentPlan.stripe_connect_id !== 'main'
              ? paymentPlan.application_fee_percent.toFixed(2)
              : undefined,
          coupon: coupon?.id,
          default_tax_rates: salesTaxRate ? [salesTaxRate.id] : [],
        };
        return t;
      })
    );
  } else {
    throw new Error(`Payment plan type ${paymentPlan.type} not supported`);
  }
  return phases;
}

async function getPaymentPlan(
  sku_id: any,
  payment_plan_id: any,
  discount_code: any
) {
  const paymentPlan = (
    await getPaymentPlans({ sku_id, payment_plan_id, discount_code })
  )[0];
  console.log(`Payment Plan: ${JSON.stringify(paymentPlan)}`);
  return paymentPlan;
}

async function getSalesTaxRate(
  paymentPlan: any,
  stripeAccount: IStripeConnectAccount
): Promise<Stripe.Stripe.TaxRate> {
  return paymentPlan.sales_tax_rate
    ? (await loadAll(stripe.taxRates, { active: true }, stripeAccount)).find(
        tax => +tax.percentage === paymentPlan.sales_tax_rate
      )
    : null;
}

async function getCoupon(
  discount_code: any,
  paymentPlan: any,
  stripeAccount: IStripeConnectAccount
) {
  let coupon: Stripe.Stripe.Coupon;

  if (discount_code) {
    const codes = await getPromoCodes({
      code: discount_code,
      registration_id: paymentPlan.registration_id,
      stripe_connect_id: paymentPlan.stripe_connect_id,
    });

    if (codes && codes.length > 0 && codes[0]) {
      coupon = (await loadAll(stripe.coupons, null, stripeAccount)).find(
        coupon => coupon.metadata.externalId === codes[0].promo_code_id
      );
      console.log(
        `Using Stripe Coupon '${coupon.id}' for promo code '${discount_code}'`
      );
      return coupon;
    } else {
      console.log(
        `Coupon for promo code '${discount_code}' not found in Stripe`
      );
    }
  }
  return null;
}
