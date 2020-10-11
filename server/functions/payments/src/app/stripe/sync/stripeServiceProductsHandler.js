import { StripeObject } from './stripeObject.js';

export default class StripeServiceProductsHandler extends StripeObject {
  constructor(endpoint, stripeAccount) {
    super(stripeAccount);
    this.endpoint = endpoint.products;
  }

  map = dbProd => {
    const product = {
      id: dbProd.sku_id,
      name:
        dbProd.product_name + (dbProd.sku_name ? ': ' + dbProd.sku_name : ''),
      type: 'service',
      active: true,
      metadata: {
        externalId: dbProd.sku_id,
        event_id: dbProd.event_id,
        division_id: dbProd.division_id,
        price: +dbProd.price,
        event_startdate: dbProd.sale_startdate,
        event_enddate: dbProd.sale_enddate,
        sales_tax_rate: dbProd.sales_tax_rate,
      },
    };
    // console.log(JSON.stringify(product, null, '  '));
    return product;
  };

  equal = (product, stripeProduct) => {
    return (
      product.name === stripeProduct.name &&
      product.active === !!stripeProduct.active &&
      product.type === stripeProduct.type &&
      product.metadata.externalId === stripeProduct.metadata.externalId &&
      product.metadata.price === +stripeProduct.metadata.price &&
      product.metadata.event_id === stripeProduct.metadata.event_id &&
      product.metadata.division_id === stripeProduct.metadata.division_id &&
      product.metadata.sales_tax_rate ===
        +stripeProduct.metadata.sales_tax_rate &&
      product.metadata.event_startdate ===
        stripeProduct.metadata.event_startdate &&
      product.metadata.event_enddate === stripeProduct.metadata.event_enddate
    );
  };

  update = async product => {
    const updatedProd = { ...product };
    delete updatedProd.type;

    return await super.update(updatedProd, false);
  };
}
