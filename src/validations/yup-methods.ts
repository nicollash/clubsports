import * as Yup from 'yup';

declare module 'yup' {
  interface ArraySchema<T> {
    unique(mapper: (entity: T) => string, message?: string): ArraySchema<T>;
  }
}

Yup.addMethod(Yup.array, 'unique', function(
  mapper = (entity: any) => entity,
  message: string = `Not have duplicates`
) {
  return this.test(
    'unique',
    message,
    list => list.length === new Set(list.map(mapper)).size
  );
});
