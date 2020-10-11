import * as Yup from 'yup';

const facilitySchema = Yup.object({
  facilities_description: Yup.string().required(
    'Facility name is required to fill!'
  ),
});

export { facilitySchema };
