export class StripeObject {
  constructor(stripeAccount) {
    this.requestParams =
      stripeAccount === 'main' ? null : { stripeAccount: stripeAccount };
  }

  map = dbProd => {};

  async list(params) {
    const objects = [];
    for await (const object of this.endpoint.list(
      {
        limit: 100,
        ...params,
      },
      this.requestParams
    )) {
      objects.push(object);
    }
    return objects;
  }

  equal = (object, stripeObject) => {};

  async delete(object) {
    console.log(
      `Deactivating object: ${object.name} (${
        object.id || object.metadata?.externalId
      })`
    );
    const stripeProduct = await this.endpoint.update(
      object.id,
      {
        active: false,
      },
      this.requestParams
    );
    return stripeProduct;
  }

  async create(object) {
    console.log(
      `Creating object: ${object.name || object.nickname} (${
        object.id || object.metadata?.externalId
      })`
    );
    try {
      const stripeObject = await this.endpoint.create(
        object,
        this.requestParams
      );
      return stripeObject;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async update(object, updateViaDelete = false) {
    console.log(`Updating object: ${object.name} (${object.id})`);
    let stripeObject;
    const updatedObject = { ...object };
    delete updatedObject.id;
    if (updateViaDelete) {
      this.delete(object);
      stripeObject = await this.create(updatedObject);
    } else {
      stripeObject = await this.endpoint.update(
        object.id,
        updatedObject,
        this.requestParams
      );
    }
    return stripeObject;
  }
}
