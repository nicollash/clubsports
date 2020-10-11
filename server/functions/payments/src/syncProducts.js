// Sync products between Events/Registrations and Stripe
import './services/logger';

import { syncWithStripe } from './app/stripe/sync/syncWithStripe.js';

export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  console.init(context);

  try {
    await syncWithStripe();
  } catch (err) {
    console.logError(err);
  }
};
