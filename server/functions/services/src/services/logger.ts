import { sendSnsMessage } from './aws-utils';
import { Context } from 'aws-lambda';

let context: Context;

declare global {
  interface Console {
    logError(error: Error): Promise<void>;
    init(context: Context): void;
  }
}

console.init = _context => {
  context = _context;
};

console.logError = async (error: Error) => {
  console.log(error);
  sendSnsMessage(process.env.EVENT_NOTIFICATIONS_TOPIC!, 'Error in Payments', {
    message: error.message,
    stack: error.stack,
    context,
  });
};
