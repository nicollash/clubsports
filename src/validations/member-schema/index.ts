import * as Yup from 'yup';

const memberSchema = Yup.object({
  first_name: Yup.string().required('First name is required to fill!'),
  last_name: Yup.string().required('Last name is required to fill!'),
});

export { memberSchema };
