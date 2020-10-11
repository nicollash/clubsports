const removeObjKeysByKeys = (obj: Object, fields: string[]) =>
  fields.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});

export { removeObjKeysByKeys };
