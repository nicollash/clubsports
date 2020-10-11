import SSM from 'aws-sdk/clients/ssm.js';
import SNS from 'aws-sdk/clients/sns.js';

const sns = new SNS({ apiVersion: '2010-03-31', region: 'us-east-1' });
const ssm = new SSM({ region: 'us-east-1' });

let privateDbParams: any;
let publicDbParams: any;

export const getDbParams = async () => {
  if (!publicDbParams || !privateDbParams) {
    [privateDbParams, publicDbParams] = await Promise.all([
      getParams(process.env.PRIVATE_API_SM_PARAMETER_NAME!),
      getParams(process.env.PUBLIC_API_SM_PARAMETER_NAME!),
    ]);
    console.log('Obtained DB parameters');
  }
  return [privateDbParams, publicDbParams];
};

const getParams = async (paramName: string) => {
  return JSON.parse(
    (await ssm
      .getParameter({
        Name: paramName,
        WithDecryption: true,
      })
      .promise())!.Parameter!.Value!
  );
};

export const sendSnsMessage = async (
  topic: string,
  subject: string,
  message: object | string
) => {
  let params = {
    Subject: subject,
    Message: typeof message === 'object' ? JSON.stringify(message) : message,
    TopicArn: topic,
  };
  try {
    const data = await sns.publish(params).promise();
    console.log('Response from SNS', data);
  } catch (err) {
    console.error('Error in SNS', err);
  }
};

export const sendEmail = async (data: object) => {
  return await sendSnsMessage(
    process.env.USER_EVENTS_TOPIC!,
    'SendEmail',
    data
  );
};
