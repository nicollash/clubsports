#!/bin/bash
# uploadLambdaCode.sh
# Author: GMind LLC
# Date: 04/28/2020

# AWS_PROFILE="clubsports"

rm -Rf dist/*
mkdir -p ./dist/lambda
npm run build
pushd ./dist/lambda
cp ../../package.json .
cp -R ../../src/fonts .

mkdir -p node_modules

docker run -v $(pwd):/var/task lambci/lambda:build-nodejs12.x npm install
# docker run -v $(pwd):/var/task -it lambci/lambda:build-nodejs12.x npm install phantomjs-prebuilt
# read

# npm install --production
# rm package*.json
# touch package.json
zip -r ../bundle.zip *
popd

# STACK_NAME="TourneyMasterPayments"

if [ -z "$STACK_NAME" ] 
then
  STACK_NAME="TourneyMasterPayments"
	echo "\$STACK_NAME is empty. Using default value STACK_NAME=$STACK_NAME"
else
	echo "STACK_NAME=$STACK_NAME"
fi

S3_BUNDLE_NAME=$STACK_NAME/services/bundle.zip

aws s3 cp dist/bundle.zip s3://clubsports-lambda-code/$S3_BUNDLE_NAME

aws lambda update-function-code --function-name "$STACK_NAME-ServicesApiFunction" --s3-bucket clubsports-lambda-code --s3-key "$S3_BUNDLE_NAME"
aws lambda update-function-code --function-name "$STACK_NAME-SendEmailFunction" --s3-bucket clubsports-lambda-code --s3-key "$S3_BUNDLE_NAME"
aws lambda update-function-code --function-name "$STACK_NAME-IncomingMessageFunction" --s3-bucket clubsports-lambda-code --s3-key "$S3_BUNDLE_NAME"

aws lambda update-function-configuration --function-name "$STACK_NAME-IncomingMessageFunction" \
  --environment "Variables={PRIVATE_API_BASE_URL=$PRIVATE_API_BASE_URL,\
  EVENT_NOTIFICATIONS_TOPIC="arn:aws:sns:us-east-1:564748484972:$STACK_NAME-ErrorsTopic",\
  INCOMING_MESSAGE_TOPIC="arn:aws:sns:us-east-1:564748484972:$STACK_NAME-IncomingMessageTopic",\
  AWS_USER_POOL_ID=$AWS_USER_POOL_ID,\
  AWS_USER_POOL_CLIENT_ID=$AWS_USER_POOL_CLIENT_ID,\
  PRIVATE_API_ADMIN_USERNAME=$PRIVATE_API_ADMIN_USERNAME,\
  PRIVATE_API_ADMIN_PASSWORD=$PRIVATE_API_ADMIN_PASSWORD}"