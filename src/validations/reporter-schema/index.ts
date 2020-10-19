import * as Yup from "yup";

const reporterSchema = Yup.object({
  sms_scorer_id: Yup.string().required("Reporter sms_scorer_id is required"),
  event_id: Yup.string().required("Reporter event_id is required"),
  first_name: Yup.string().required("Reporter first_name is required"),
  last_name: Yup.string().required("Reporter last_name is required"),
  mobile: Yup.string().required("Reporter mobile is required"),
  is_active_YN: Yup.number(),
});

const reporterSchemaCsv = Yup.object({
  sms_scorer_id: Yup.string(),
  event_id: Yup.string().required("Reporter event_id is required"),
  First: Yup.string().required("Reporter First is required"),
  Last: Yup.string().required("Reporter Last is required"),
  Mobile: Yup.string().required("Reporter Mobile is required"),
  Do_Not_Use:Yup.string(),
  is_active_YN: Yup.number(),
});



export { reporterSchema, reporterSchemaCsv };
