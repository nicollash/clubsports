import Stripe from 'stripe';

export enum RegType {
  TEAM = 'team',
  INDIVIDUAL = 'individual',
}

export type SubItem = {
  registrant: string;
  reg_response_id: string;
  sku_id: string;
  payment_plan_id: string;
  quantity: number;
  discount_code?: string;
};

export interface CustomerData {
  name: string;
  email: string;
  phone?: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}

export type SubData = {
  reg_type: RegType;
  registration_id: string;
  customer: CustomerData;
  paymentMethodId: string;
  items: SubItem[];
};

export type IStripeConnectAccount = Stripe.RequestOptions | undefined;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-03-02',
  maxNetworkRetries: 3,
});

export const loadAll = async (
  endpoint: any,
  params: object | null = {},
  requestParams: IStripeConnectAccount
) => {
  const objects = [];
  for await (const object of endpoint.list(
    {
      ...params,
      limit: 100,
    },
    requestParams
  )) {
    objects.push(object);
  }
  return objects;
};
