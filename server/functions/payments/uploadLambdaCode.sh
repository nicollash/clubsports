#!/bin/bash

rm -Rf dist/*
mkdir -p ./dist/lambda
npm run build
pushd ./dist/lambda
cp ../../package.json .

mkdir -p node_modules

docker run -v $(pwd):/var/task lambci/lambda:build-nodejs12.x npm install --production

zip -r ../bundle.zip *
popd

if [ -z "$STACK_NAME" ] 
then
  STACK_NAME="TourneyMasterPayments"
	echo "\$STACK_NAME is empty. Using default value STACK_NAME=$STACK_NAME"
else
	echo "STACK_NAME=$STACK_NAME"
fi

S3_BUNDLE_NAME=$STACK_NAME/payments/bundle.zip

aws s3 cp dist/bundle.zip s3://clubsports-lambda-code/$S3_BUNDLE_NAME


aws lambda update-function-code --function-name "$STACK_NAME-SyncProductsFunction" --s3-bucket clubsports-lambda-code --s3-key "$S3_BUNDLE_NAME"
aws lambda update-function-configuration --function-name "$STACK_NAME-SyncProductsFunction" \
  --environment "Variables={PUBLIC_API_SM_PARAMETER_NAME=$PUBLIC_API_SM_PARAMETER_NAME,\
  STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY,\
  PUBLIC_API_SM_PARAMETER_NAME=$PUBLIC_API_SM_PARAMETER_NAME,\
  PRIVATE_API_SM_PARAMETER_NAME=$PRIVATE_API_SM_PARAMETER_NAME,\
  EVENT_NOTIFICATIONS_TOPIC="arn:aws:sns:us-east-1:564748484972:$STACK_NAME-ErrorsTopic",\
  STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY,\
  PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL}"

aws lambda update-function-code --function-name "$STACK_NAME-PaymentsApiFunction" --s3-bucket clubsports-lambda-code --s3-key "$S3_BUNDLE_NAME"
aws lambda update-function-configuration --function-name "$STACK_NAME-PaymentsApiFunction" \
  --environment "Variables={MAX_PAYMENT_AMOUNT=$MAX_PAYMENT_AMOUNT,\
  PUBLIC_API_SM_PARAMETER_NAME=$PUBLIC_API_SM_PARAMETER_NAME,\
  PRIVATE_API_SM_PARAMETER_NAME=$PRIVATE_API_SM_PARAMETER_NAME,\
  STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY,\
  STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY,\
  PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL,\
  EVENT_NOTIFICATIONS_TOPIC="arn:aws:sns:us-east-1:564748484972:$STACK_NAME-ErrorsTopic",\
  USER_EVENTS_TOPIC="arn:aws:sns:us-east-1:564748484972:$STACK_NAME-UserEventsTopic",\
  STRIPE_WEBHOOK_SIGNING_SECRET=$STRIPE_WEBHOOK_SIGNING_SECRET,\
  STRIPE_CONNECT_WEBHOOK_SIGNING_SECRET=$STRIPE_CONNECT_WEBHOOK_SIGNING_SECRET}"
