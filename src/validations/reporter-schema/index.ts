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
  event_id: Yup.string().required("Reporter event_id is required"),
  first_name: Yup.string().required("Reporter First is required"),
  last_name: Yup.string().required("Reporter Last is required"),
  mobile: Yup.string().required("Reporter Mobile is required"),
  is_active_YN: Yup.number(),
});

export { reporterSchema, reporterSchemaCsv };
