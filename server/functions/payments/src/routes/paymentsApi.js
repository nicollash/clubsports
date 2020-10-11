import '../services/logger';
import { createSubscription } from '../app/stripe/subscriptions/subscriptions';
import { stripeWebhook } from '../app/stripe/webhooks/webhook';
import { getPaymentPlans } from '../app/products/activeProducts.js';

export default api => {
  api.post('/create-subscription', async (req, res) => {
    let results = [];
    try {
      results = await createSubscription(req.body);

      const success =
        results.findIndex(result => result.status === 'fulfilled') !== -1;
      if (!success) throw new Error(results[0]?.reason);

      const partial =
        results.findIndex(result => result.status === 'rejected') !== -1;

      res.json({
        success: true,
        partial,
        subscriptions: results,
      });
    } catch (err) {
      console.logError(err);
      res.json({
        success: false,
        partial: false,
        subscriptions: results,
        message: err.message,
      });
    }
  });

  api.get('/payment-plans', async (req, res) => {
    try {
      const { sku_id, product_id, payment_plan_id, discount_code } = req.query;
      const data = await getPaymentPlans({
        sku_id,
        product_id,
        discount_code,
        payment_plan_id,
      });

      res.json(data);
    } catch (err) {
      console.logError(err);
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  });

  api.post('/payment-success', async (req, res) => {
    try {
      await stripeWebhook(req);

      res.json({
        success: true,
        message: 'OK',
      });
    } catch (err) {
      console.logError(err);
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  });

  return api;
};
