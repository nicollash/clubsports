import '../../../services/logger';
import { Request } from 'express';
import { stripe } from '../common/common';
import * as Stripe from 'stripe';
import { invoicePaymentSucceededOrFailed } from './invoicePaymentSucceeded';
import { chargeRefunded } from './chargeRefunded';

interface ExtRequest extends Request {
  rawBody: string;
}

export const stripeWebhook = async (req: ExtRequest) => {
  const extractEventFromReq = (req: ExtRequest) => {
    try {
      let event: Stripe.Stripe.Event;
      if (process.env.NODE_ENV === 'development') {
        event = req.body;
        console.log(
          'Bypassing Webhook Stripe signature verification on development'
        );
      } else {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
          throw new Error('Stripe signature not found');
        }

        let endpointSecret = req.body.account
          ? process.env.STRIPE_CONNECT_WEBHOOK_SIGNING_SECRET
          : process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
        if (!endpointSecret) {
          throw new Error(
            'Stripe webhook endpoint signing secret not configured'
          );
        }

        event = stripe.webhooks.constructEvent(
          req.rawBody,
          signature,
          endpointSecret
        );
        console.log('Webhook Stripe signature verified.');
      }

      return event;
    } catch (err) {
      console.log('Webhook Stripe signature verification: FAILED');
      throw new Error(`Webhook Error: ${err.message}`);
    }
  };

  const event = extractEventFromReq(req);

  console.log(`Processing event: ${event.type}`);
  switch (event.type) {
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed':
      await invoicePaymentSucceededOrFailed(event);
      break;
    case 'charge.refunded':
    case 'charge.refund_updated':
      await chargeRefunded(event);
      break;
    default:
      throw new Error(`Event '${event.type}' not supported by the webhook`);
  }

  return;
};
