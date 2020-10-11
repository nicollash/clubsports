#!/bin/bash

pushd payments
source ./uploadLambdaCode.sh
popd

pushd services
source ./uploadLambdaCode.sh
popd