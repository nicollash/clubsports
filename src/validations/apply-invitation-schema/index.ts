import * as Yup from 'yup';

const applyInvitationSchema = Yup.object({
  org_id: Yup.string().required('Invitation Code is required to fill!'),
});

export { applyInvitationSchema };
