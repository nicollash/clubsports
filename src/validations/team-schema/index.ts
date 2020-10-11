import * as Yup from "yup";

const teamSchema = Yup.object({
  long_name: Yup.string().required("Team Long Name is required"),
  short_name: Yup.string().required("Team Short Name is required"),
  //  short_name: Yup.string().required('Team short name is required to fill!'),
  division_id: Yup.string().required("Division is required"),
  // phone_num: Yup.string().nullable().required("Phone numbers are required"),
  //  phone_num: Yup.string().matches(
  //   /^\+?[1-9]\d{1,14}$/,
  //  'Invalid format for phone number'
  //  ),
});

const playerSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  team_name: Yup.string().required("Team is required"),
  division_name: Yup.string().required("Division is required"),
});

export { teamSchema, playerSchema };
