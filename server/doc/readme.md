# TourneyMaster Payments Server

TourneyMaster Payments Server is an extension to Public API that allows processing payments.

The payment workflow follows the Stripe's PaymentIntent-based workflow: https://stripe.com/docs/payments/integration-builder

## Endpoints

### POST /payments/create-payment-intent
Obtain a payment intent before confirming a card.

POST /payments/create-payment-intent
Headers: Content-Type: application/json
Body Example:
{
  "reg_type": "team",
  "reg_response_id": "HDFK7FJS",
  "order": {
    "email": "test@test.com",
    "items": [
    	{
    		"sku_id": "div_ADRL2028",
    		"quantity": "1"
    	},
    	{
    		"sku_id": "div_ADRL2026",
    		"quantity": "2"
    	}
    ]
  }
}

### POST /payments/payment-success
A webhook invoked by Stripe upon successful payment.
Copies registration information from "registrations" database to "events" adding Stripe specific information.


## Components
All components are deployed using a CloudFormation stack.

### API Gateway
Resource: /payments

### SyncProductsFunction

Runs every 1 minute and synchronizes /products and /skus PublicAPI endpoints with Stripe's Products and SKUs.

### PaymentsApiFunction

Implements PublicAPI's /payments endpoint as a Lambda Proxy.

POST /payments/create-payment-intent

### Environment Variables

- STRIPE_PUBLISHABLE_KEY:
- STRIPE_SECRET_KEY:
- STRIPE_WEBHOOK_SIGNING_SECRET:
- STACK_NAME: Example: 'TMPaymentsPROD'
- PUBLIC_API_BASE_URL: Example: 'https://api.tourneymaster.org/publicprod'
- PRIVATE_API_SM_PARAMETER_NAME: Example: 'TourneyMasterAPIv2'
- PUBLIC_API_SM_PARAMETER_NAME: Example: 'TMPublicApiPROD'
- MAX_PAYMENT_AMOUNT: The server will refuse payments above MAX_PAYMENT_AMOUNT. For PROD the parameter is set in .github/workflows/deploy-server-prod.yml
