import mysql from 'promise-mysql';
import axios from '../../services/tm-axios';
import dateFormat from 'dateformat';
import { getDbParams } from '../../services/aws-utils';

export const getPromoCodes = async ({
  registration_id,
  code,
  stripe_connect_id,
}) => {
  let conn;

  try {
    console.log('Loading Promo Codes.');
    const dbParams = (await getDbParams())[0];

    conn = await mysql.createConnection(dbParams.db);
    console.log('Connected to DB');

    let sql = 'select * from v_promo_codes_with_acc where is_active_YN=1 ';
    const params = [];

    if (registration_id) {
      sql += ' and registration_id=? ';
      params.push(registration_id);
    }
    if (code) {
      sql += ' and code=? ';
      params.push(code);
    }
    if (stripe_connect_id) {
      sql += ' and stripe_connect_id=? ';
      params.push(stripe_connect_id);
    }

    const promoCodes = await conn.query(sql, params);

    console.log(`Promo Codes: ${JSON.stringify(promoCodes)}`);

    return promoCodes;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.end();
    }
  }
};

export const getActiveProducts = async () => {
  return axios.get('/products').then(data => {
    return data.data;
  });
};

export const getActiveSkus = async stripeAccount => {
  return axios
    .get(`/skus${stripeAccount ? '?stripe_connect_id=' + stripeAccount : ''}`)
    .then(data => {
      return data.data;
    });
};

export const getPaymentPlans = async ({
  product_id = null,
  sku_id = null,
  payment_plan_id = null,
  discount_code = null,
  stripe_connect_id = null,
}) => {
  let query =
    '?' +
    (product_id !== null ? `product_id=${product_id}` : '') +
    (sku_id !== null ? `&sku_id=${sku_id}` : '') +
    (stripe_connect_id !== null
      ? `&stripe_connect_id=${stripe_connect_id}`
      : '');
  // console.log(`sku_id: ${sku_id}, payment_plan_id: ${payment_plan_id}`);

  const skus = await axios.get(`/skus${query}`);

  let promoCodes = [];
  if (discount_code) {
    promoCodes = await getPromoCodes({ code: discount_code });
  }

  // console.log(`Query: ${query}, Skus: ${skus}`);
  if (skus.data?.length > 0) {
    const paymentPlans = skus.data.flatMap(sku => {
      if (sku.payment_schedule_json) {
        sku.payment_schedule_json = JSON.parse(sku.payment_schedule_json);
      }

      let discount = 0;
      let discountNotice = '';
      if (discount_code) {
        const codes = promoCodes.filter(
          promoCode => promoCode.registration_id === sku.registration_id
        );

        if (codes && codes.length > 0 && codes[0]) {
          discount = codes[0].percent_off;
          discountNotice = ` (${discount_code} applied)`;
        }
      }

      let paymentPlans = [];
      if (
        Array.isArray(sku.payment_schedule_json) &&
        sku.payment_schedule_json.length > 0
      ) {
        paymentPlans = sku.payment_schedule_json
          .map(rawPaymentPlan => {
            if (rawPaymentPlan.type === 'installment') {
              const discountAmount =
                Math.round(
                  ((+sku.price * (discount / 100)) /
                    +rawPaymentPlan.iterations) *
                    100
                ) / 100;
              const installmentPrice =
                Math.round((+sku.price / +rawPaymentPlan.iterations) * 100) /
                  100 -
                discountAmount;
              const installmentPriceWithTax =
                Math.round(
                  installmentPrice * (1 + sku.sales_tax_rate / 100) * 100
                ) / 100;
              const recurringPayments =
                +rawPaymentPlan.iterations > 1
                  ? `$${installmentPriceWithTax.toFixed(
                      2
                    )} for ${+rawPaymentPlan.iterations} times every${
                      +rawPaymentPlan.intervalCount > 1
                        ? +' ' + rawPaymentPlan.intervalCount
                        : ''
                    } ${rawPaymentPlan.interval}${
                      +rawPaymentPlan.intervalCount > 1 ? 's' : ''
                    } for `
                  : '';
              const { payment_schedule_json, ...paymentPlan } = {
                ...sku,
                price: installmentPrice,
                total_price: installmentPrice * rawPaymentPlan.iterations,
                discount: 0,
                payment_plan_id: sku.sku_id + '_' + rawPaymentPlan.id,
                payment_plan_name: rawPaymentPlan.name,
                payment_plan_notice: `The Installment Schedule is${discountNotice}:  ${recurringPayments}the total amount of $${(
                  installmentPriceWithTax * rawPaymentPlan.iterations
                ).toFixed(2)}`,
                type: rawPaymentPlan.type,
                iterations: rawPaymentPlan.iterations,
                interval: rawPaymentPlan.interval,
                intervalCount: rawPaymentPlan.intervalCount,
                billing_cycle_anchor: 0,
              };
              return paymentPlan;
            } else if (rawPaymentPlan.type === 'schedule') {
              const schedule = {};
              let billingCycleAnchor;
              for (let phase of rawPaymentPlan.schedule) {
                let amount =
                  phase.amountType === 'fixed'
                    ? +phase.amount
                    : phase.amountType === 'percent'
                    ? Math.round(+sku.price * +phase.amount) / 100
                    : null;
                if (!amount) {
                  throw new Error('Incorrect amount specified.');
                }

                const discountAmount =
                  Math.round(amount * (discount / 100) * 100) / 100;

                amount -= discountAmount;

                const date = +phase.date;
                const now = new Date().getTime() / 1000;
                if (date <= now) {
                  if (!schedule['now']) schedule['now'] = 0;
                  schedule['now'] += amount;
                  if (!billingCycleAnchor || date > billingCycleAnchor) {
                    // Set billing anchor to the last of the payment deadlines that are before now
                    billingCycleAnchor = date;
                  }
                } else {
                  if (!schedule[date]) schedule[date] = 0;
                  schedule[date] += amount;
                  if (!billingCycleAnchor) {
                    // If no billing anchor yet set it to any of the phases
                    billingCycleAnchor = date;
                  }
                }
              }

              const scheduleArr = Object.entries(schedule)
                .map(([date, amount]) => ({
                  date,
                  billing_cycle_anchor:
                    date === 'now' ? billingCycleAnchor : date,
                  amount,
                  price_external_id:
                    sku.sku_id + '_' + rawPaymentPlan.id + '_' + date,
                  amountWithTax:
                    Math.round(amount * (1 + sku.sales_tax_rate / 100) * 100) /
                    100,
                }))
                .sort((a, b) =>
                  b.date === 'now'
                    ? 1
                    : a.date === 'now'
                    ? -1
                    : +a.date - +b.date
                );

              const { payment_schedule_json, ...paymentPlan } = {
                ...sku,
                total_price: scheduleArr.reduce((a, c) => a + c.amount, 0),
                discount: 0,
                payment_plan_id: sku.sku_id + '_' + rawPaymentPlan.id,
                payment_plan_name: rawPaymentPlan.name,
                payment_plan_notice: `The Installment Schedule is${discountNotice}: ${scheduleArr
                  .map(
                    x =>
                      `${
                        x.date === 'now'
                          ? 'now'
                          : dateFormat(new Date(x.date * 1000), 'yyyy-mm-dd')
                      }: $${x.amountWithTax.toFixed(2)}`
                  )
                  .join(', ')}`,
                type: rawPaymentPlan.type,
                schedule: scheduleArr,
              };
              return paymentPlan;
            } else {
              throw new Error(
                `Unknown payment plan type ${rawPaymentPlan.type}`
              );
            }
          })
          .filter(x => x);
      }
      // If no payment schedule specified (likely a front end bug) still allow to pay in full
      if (!paymentPlans || paymentPlans.length === 0) {
        const discountAmount =
          Math.round(+sku.price * (discount / 100) * 100) / 100;

        const { payment_schedule_json, ...paymentPlan } = {
          ...sku,
          price: sku.price - discountAmount,
          total_price: sku.price - discountAmount,
          payment_plan_id: sku.sku_id + '_FP',
          payment_plan_name: 'Pay in full',
          payment_plan_notice: `Your credit card will be charged $${(
            (sku.price - discountAmount) *
            (1 + sku.sales_tax_rate / 100)
          ).toFixed(2)} now ${discountNotice}.`,
          type: 'installment',
          discount: 0,
          iterations: 1,
          interval: 'month',
          intervalCount: 1,
          billing_cycle_anchor: 0,
        };
        return paymentPlan;
      } else {
        return paymentPlans;
      }
    });
    if (payment_plan_id) {
      return paymentPlans.filter(p => p.payment_plan_id === payment_plan_id);
    } else {
      return paymentPlans;
    }
  } else {
    return [];
  }
};
