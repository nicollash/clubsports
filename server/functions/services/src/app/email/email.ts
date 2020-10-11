import SES from 'aws-sdk/clients/ses.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dateFormat from 'dateformat';
import nodemailer from 'nodemailer';
import inlineBase64 from 'nodemailer-plugin-inline-base64';
import SESTransport from 'nodemailer/lib/ses-transport';

const template = readFileSync(
  join(__dirname, 'templates/SuccessfulRegistration.html'),
  'utf8'
);

const CONFIGURATION_SET_NAME = 'TourneyMastercom';
const FROM_EMAIL = 'admin@tourneymaster.com';

const ses = new SES({ region: 'us-east-1' });

export const composeAndSendEmail = async (data: any) => {
  let htmlBody = template;
  const welcomeEmailSettings = data.registration.welcome_email_settings
    ? JSON.parse(data.registration.welcome_email_settings)
    : {};

  welcomeEmailSettings.body = welcomeEmailSettings.body.replace(
    '"></p>',
    '"/></p>'
  );

  const fields: any = {
    ...welcomeEmailSettings,
    additionalInformation: '',
    amountDue: '$' + data.reg_response.amount_due.toFixed(2),
    amountPaid:
      '$' + (data.paymentSuccessEvent.data.object.amount_paid / 100).toFixed(2),
    cancellationPolicy: welcomeEmailSettings.includeCancellationPolicy
      ? data.registration.disclaimer
      : '',
    card: '',
    eventLogo: welcomeEmailSettings.includeEventLogo
      ? `<img width='200' src='https://tourneymaster.s3.amazonaws.com/public/${data.event.desktop_icon_URL}'/>`
      : '',
    eventName: data.paymentPlan.product_name
      .replace('Registration:', '')
      .trim(),
    teamName: data.reg_response.team_name,
    divisionName: data.reg_response.division_name,
    firstName:
      data.reg_response.contact_first_name ||
      data.reg_response.registrant_first_name,
    invoiceDate: dateFormat(data.reg_response.payment_date, 'mm/dd/yyyy'),
    invoiceId: `${data.reg_response.ext_payment_id} (or ${data.reg_response.reg_response_id})`,
    extPaymentId: data.reg_response.ext_payment_id,
    regResponseId: data.reg_response.reg_response_id,
    invoicePdf: data.paymentSuccessEvent.data.object.invoice_pdf,
    outstandingBalance:
      '$' +
      (
        data.reg_response.amount_due -
        data.paymentSuccessEvent.data.object.amount_paid / 100
      ).toFixed(2),
    paymentPlan: data.paymentPlan.payment_plan_notice,
    to: data.reg_response.registrant_email || data.reg_response.contact_email,
  };

  for (const key in fields) {
    htmlBody = htmlBody.split(`{{${key}}}`).join(fields[key]);
  }

  const transporter = nodemailer.createTransport({
    SES: ses,
  });

  const params: SESTransport.MailOptions = {
    from: `${fields.from} <${FROM_EMAIL}>`,
    to: fields.to,
    subject: fields.subject,
    html: htmlBody,
    replyTo: fields.replyTo,
    ses: { ConfigurationSetName: CONFIGURATION_SET_NAME },
  };
  console.log(`Email params:`, params);

  transporter.use('compile', inlineBase64({ cidPrefix: 'cidPrefix_' }));

  const result = await transporter.sendMail(params);

  // const result = await ses.sendEmail(params).promise();
  console.log(`Email sending result: `, result);
};
