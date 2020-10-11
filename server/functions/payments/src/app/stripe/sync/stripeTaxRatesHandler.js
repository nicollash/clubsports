import { StripeObject } from './stripeObject.js';

export default class StripeTaxRatesHandler extends StripeObject {
  constructor(endpoint, stripeAccount) {
    super(stripeAccount);
    this.endpoint = endpoint.taxRates;
  }

  map = dbTax => {
    const tax = {
      active: true,
      display_name: dbTax.display_name,
      description: dbTax.description,
      inclusive: dbTax.inclusive,
      jurisdiction: dbTax.jurisdiction,
      percentage: dbTax.sales_tax_rate,
      metadata: { externalId: String(dbTax.sales_tax_rate) },
    };
    return tax;
  };

  equal = (taxRate, stripeTaxRate) => {
    return (
      taxRate.display_name === stripeTaxRate.display_name &&
      taxRate.description === stripeTaxRate.description &&
      taxRate.active === !!stripeTaxRate.active &&
      taxRate.inclusive === !!stripeTaxRate.inclusive &&
      taxRate.jurisdiction === stripeTaxRate.jurisdiction &&
      taxRate.percentage === +stripeTaxRate.percentage &&
      taxRate.metadata.externalId === stripeTaxRate.metadata.externalId
    );
  };

  list = async params => {
    return super.list({ active: true });
  };

  update = async taxRate => {
    return await super.update(taxRate, true);
  };
}
