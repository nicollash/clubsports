import { StripeObject } from './stripeObject.js';

export default class StripePricesHandler extends StripeObject {
  constructor(endpoint, stripeAccount) {
    super(stripeAccount);
    this.endpoint = endpoint.prices;
  }

  map = paymentPlan => {
    if (paymentPlan.type === 'installment') {
      const stripePrice = {
        currency: paymentPlan.currency,
        unit_amount: Math.round(+paymentPlan.price * 100, 0),
        active: true,
        nickname: paymentPlan.payment_plan_name,
        product: paymentPlan.sku_id,
        recurring: {
          interval: paymentPlan.interval,
          interval_count: +paymentPlan.intervalCount,
        },
        metadata: {
          type: paymentPlan.type,
          externalId: paymentPlan.payment_plan_id,
          name: paymentPlan.sku_name,
          total_price: paymentPlan.total_price,
          event_id: paymentPlan.event_id,
          division_id: paymentPlan.division_id,
          owner_id: paymentPlan.owner_id,
          sales_tax_rate: paymentPlan.sales_tax_rate,
          iterations: +paymentPlan.iterations,
          billing_cycle_anchor: +paymentPlan.billing_cycle_anchor,
        },
      };
      return stripePrice;
    } else if (paymentPlan.type === 'schedule') {
      const stripePrices = [];
      for (const [index, phase] of paymentPlan.schedule.entries()) {
        const stripePrice = {
          currency: paymentPlan.currency,
          unit_amount: Math.round(+phase.amount * 100, 0),
          active: true,
          nickname:
            paymentPlan.payment_plan_name + `. Installment ${index + 1}`,
          product: paymentPlan.sku_id,
          // recurring: {
          //   interval: 'month',
          //   interval_count: 12,
          // },
          metadata: {
            type: paymentPlan.type,
            externalId: phase.price_external_id,
            payment_plan_id: paymentPlan.payment_plan_id,
            total_price: paymentPlan.total_price,
            name: paymentPlan.sku_name,
            event_id: paymentPlan.event_id,
            division_id: paymentPlan.division_id,
            owner_id: paymentPlan.owner_id,
            sales_tax_rate: paymentPlan.sales_tax_rate,
            iterations: 1,
            payment_date: phase.date,
            billing_cycle_anchor: +phase.billing_cycle_anchor,
          },
        };
        stripePrices.push(stripePrice);
      }
      return stripePrices;
    }
  };

  equal = (price, stripePrice) => {
    return (
      price.currency.toUpperCase() === stripePrice.currency.toUpperCase() &&
      price.active === stripePrice.active &&
      price.product === stripePrice.product &&
      price.unit_amount === +stripePrice.unit_amount &&
      price.nickname === stripePrice.nickname &&
      (price.metadata.type === 'schedule' ||
        (price.recurring?.interval === stripePrice.recurring?.interval &&
          price.recurring?.interval_count ===
            +stripePrice.recurring?.interval_count)) &&
      price.metadata.type === stripePrice.metadata.type &&
      price.metadata.externalId === stripePrice.metadata.externalId &&
      price.metadata.total_price === +stripePrice.metadata.total_price &&
      price.metadata.event_id === stripePrice.metadata.event_id &&
      price.metadata.division_id === stripePrice.metadata.division_id &&
      price.metadata.name === stripePrice.metadata.name &&
      price.metadata.sales_tax_rate === +stripePrice.metadata.sales_tax_rate &&
      price.metadata.iterations === +stripePrice.metadata.iterations &&
      price.metadata.billing_cycle_anchor ===
        +stripePrice.metadata.billing_cycle_anchor &&
      price.metadata.owner_id === stripePrice.metadata.owner_id &&
      price.metadata.payment_date === stripePrice.metadata.payment_date
    );
  };

  list = async params => {
    return super.list({ active: true });
  };

  update = async price => {
    return await super.update(price, true);
  };
}
