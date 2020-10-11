import { readFileSync } from 'fs';
import { join } from 'path';
import { SNSEvent } from 'aws-lambda';
import { handler } from '../incomingMessage';

const event: SNSEvent = JSON.parse(
  readFileSync(join(__dirname, 'pinpointSnsMessageEvent.json'), {
    encoding: 'utf-8',
  })
);

handler(event);
