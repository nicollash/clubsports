// Send Email via SES
import './services/logger';
import { SQSEvent, Context, SNSMessage } from 'aws-lambda';
import { composeAndSendEmail } from './app/email/email';

export const handler = async (event: SQSEvent, context?: Context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  console.init(context!);

  try {
    const snsMessage = JSON.parse(event.Records[0].body) as SNSMessage;
    const data = JSON.parse(snsMessage.Message);

    await composeAndSendEmail(data);
    return;
  } catch (err) {
    console.logError(err);
    throw err;
  }
};
