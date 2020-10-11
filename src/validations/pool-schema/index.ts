import * as Yup from 'yup';

const poolSchema = Yup.object({
  pool_name: Yup.string().required('Pool name is required to fill!'),
});

export { poolSchema };
