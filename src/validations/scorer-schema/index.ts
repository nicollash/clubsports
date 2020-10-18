import * as Yup from "yup";

const scorerSchema = Yup.object({
  column_name: Yup.string().required("Scorer Column Name is required"),
  column_display: Yup.string().required("Scorer Column Display is required"),
  //  short_name: Yup.string().required('Team short name is required to fill!'),
});



export { scorerSchema };
