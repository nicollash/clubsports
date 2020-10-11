import { readFileSync } from 'fs';
import { join } from 'path';
import { SQSEvent } from 'aws-lambda';
import { handler } from '../sendEmail';

const event: SQSEvent = JSON.parse(
  readFileSync(join(__dirname, 'sendEmailSqsMessage.json'), {
    encoding: 'utf-8',
  })
);

handler(event);
