AWS_PROFILE=clubsports

aws cloudformation update-stack \
	--stack-name TMPaymentsSTAGING \
	--template-body file://templates/TourneyMasterApiExtensions.yaml \
	--capabilities CAPABILITY_NAMED_IAM \
	--parameters file://templates/stack-params-STAGING.json