import * as Yup from 'yup';

const divisionSchema = Yup.object({
  long_name: Yup.string().required('Division long name is required to fill!'),
  short_name: Yup.string().required('Division short name is required to fill!'),
});

export { divisionSchema };
