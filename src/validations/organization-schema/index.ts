import * as Yup from 'yup';

const organizationSchema = Yup.object({
  org_name: Yup.string().required('Organization name is required to fill!'),
});

export { organizationSchema };
