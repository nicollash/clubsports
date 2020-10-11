import { StripeObject } from './stripeObject.js';

export default class StripeCouponsHandler extends StripeObject {
  constructor(endpoint, stripeAccount) {
    super(stripeAccount);
    this.endpoint = endpoint.coupons;
  }

  map = dbCoupon => {
    const coupon = {
      name: dbCoupon.name,
      duration: dbCoupon.duration,
      percent_off: dbCoupon.percent_off,
      metadata: {
        externalId: String(dbCoupon.promo_code_id),
        code: dbCoupon.code,
        event_id: dbCoupon.event_id,
        registration_id: dbCoupon.registration_id,
      },
    };
    return coupon;
  };

  equal = (coupon, stripeCoupon) => {
    return (
      coupon.name === stripeCoupon.name &&
      coupon.duration === stripeCoupon.duration &&
      coupon.percent_off === +stripeCoupon.percent_off &&
      coupon.metadata.externalId === stripeCoupon.metadata.externalId &&
      coupon.metadata.event_id === stripeCoupon.metadata.event_id &&
      coupon.metadata.registration_id ===
        stripeCoupon.metadata.registration_id &&
      coupon.metadata.code === stripeCoupon.metadata.code
    );
  };

  async delete(object) {
    console.log(
      `Deactivating object: ${object.name} (${
        object.id || object.metadata?.externalId
      })`
    );
    const deletedCoupon = await this.endpoint.del(
      object.id,
      this.requestParams
    );
    return deletedCoupon;
  }

  update = async coupon => {
    return await super.update(coupon, true);
  };
}
