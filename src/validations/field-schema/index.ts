import * as Yup from 'yup';

const fieldSchema = Yup.object({
  field_name: Yup.string().required('Field name is required to fill!'),
});

export { fieldSchema };
