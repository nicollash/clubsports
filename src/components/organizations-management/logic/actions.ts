import { ThunkAction } from 'redux-thunk';
import { ActionCreator, Dispatch } from 'redux';
import { Auth } from 'aws-amplify';
import Api from 'api/api';
import { getVarcharEight } from 'helpers';
import { organizationSchema, applyInvitationSchema } from 'validations';
import { Toasts } from 'components/common';
import { IMember, IOrganization, IOrgMember } from 'common/models';
import {
  organizationManagementAction,
  LOAD_ORGANIZATIONS_START,
  LOAD_ORGANIZATIONS_SUCCESS,
  LOAD_ORGANIZATIONS_FAILURE,
  CREATE_ORGANIZATION_SUCCESS,
  CREATE_ORGANIZATION_FAILURE,
  ADD_USER_TO_ORGANIZATION_SUCCESS,
  ADD_USER_TO_ORGANIZATION_FAILURE,
  DELETE_ORGANIZATION_SUCCESS,
  DELETE_ORGANIZATION_FAILURE,
} from './action-types';

const loadOrganizations: ActionCreator<ThunkAction<
  void,
  {},
  null,
  organizationManagementAction
>> = () => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: LOAD_ORGANIZATIONS_START });

    const currentSession = await Auth.currentSession();
    const userEmail = currentSession.getIdToken().payload.email;
    const members = await Api.get(`/members?email_address=${userEmail}`);
    const member: IMember = members.find(
      (it: IMember) => it.email_address === userEmail
    );
    const organizations = await Api.get('/organizations');
    const orgMembers = await Api.get('/org_members');

    const userOwnOrgMembers = orgMembers.filter(
      (it: IOrgMember) => it.member_id === member.member_id
    );

    const userOwnOrganizations = organizations.filter(
      (organization: IOrganization) =>
        userOwnOrgMembers.some(
          (orgMember: IOrgMember) => organization.org_id === orgMember.org_id
        ) || organization.created_by === member.member_id
    );

    dispatch({
      type: LOAD_ORGANIZATIONS_SUCCESS,
      payload: {
        organizations: userOwnOrganizations,
      },
    });
  } catch {
    dispatch({
      type: LOAD_ORGANIZATIONS_FAILURE,
    });
  }
};

const addUserToOrganization: ActionCreator<ThunkAction<
  void,
  {},
  null,
  organizationManagementAction
>> = (invCode: string) => async (dispatch: Dispatch) => {
  try {
    const currentSession = await Auth.currentSession();
    const userEmail = currentSession.getIdToken().payload.email;
    const members = await Api.get(`/members?email_address=${userEmail}`);
    const member: IMember = members.find(
      (it: IMember) => it.email_address === userEmail
    );

    const orgMembers = {
      member_id: member.member_id,
      org_member_id: getVarcharEight(),
      org_id: invCode,
    };

    await applyInvitationSchema.validate(orgMembers);

    const { length: orgMembersLength } = await Api.get(
      `/org_members?org_id=${orgMembers.org_id}&member_id=${orgMembers.member_id}`
    );

    if (orgMembersLength) {
      Toasts.errorToast('You are already joined to this organization!');
      return;
    }

    const orgMembersList = await Api.get(
      `/org_members?org_id=${orgMembers.org_id}`
    );
    if (orgMembersList.length === 0) {
      await Api.post('/org_members', orgMembers);
    }

    const organization = await Api.get(`/organizations?org_id=${invCode}`);
    const currentOrganization = organization.find(
      (it: IOrganization) => it.org_id === invCode
    );

    if (!currentOrganization) {
      return;
    }

    dispatch({
      type: ADD_USER_TO_ORGANIZATION_SUCCESS,
      payload: {
        organization: currentOrganization,
      },
    });

    Toasts.successToast('Success! You were added to the organization.');
  } catch (err) {
    Toasts.errorToast(err.message);

    dispatch({
      type: ADD_USER_TO_ORGANIZATION_FAILURE,
    });
  }
};

const createOrganization: ActionCreator<ThunkAction<
  void,
  {},
  null,
  organizationManagementAction
>> = (organizationData: IOrganization) => async (dispatch: Dispatch) => {
  try {
    const currentSession = await Auth.currentSession();
    const userEmail = currentSession.getIdToken().payload.email;
    const members = await Api.get(`/members?email_address=${userEmail}`);
    const member: IMember = members.find(
      (it: IMember) => it.email_address === userEmail
    );

    const organization = {
      ...organizationData,
      org_id: getVarcharEight(),
      org_tag: organizationData.org_tag ? `@${organizationData.org_tag}` : null,
      is_active_YN: 1,
    };

    const orgMembers = {
      member_id: member.member_id,
      org_member_id: getVarcharEight(),
      org_id: organization.org_id,
    };

    await organizationSchema.validate(organization);

    await Api.post('/organizations', organization);

    const orgMembersList = await Api.get(
      `/org_members?org_id=${orgMembers.org_id}`
    );
    if (orgMembersList.length === 0) {
      await Api.post('/org_members', orgMembers);
    }

    dispatch({
      type: CREATE_ORGANIZATION_SUCCESS,
      payload: {
        organization,
      },
    });

    Toasts.successToast('Success! You were added to the organization.');
  } catch (err) {
    Toasts.errorToast(err.message);

    dispatch({
      type: CREATE_ORGANIZATION_FAILURE,
    });
  }
};

const deleteOrganization: ActionCreator<ThunkAction<
  void,
  {},
  null,
  organizationManagementAction
>> = (organization: IOrganization) => async (dispatch: Dispatch) => {
  try {
    const currentSession = await Auth.currentSession();
    const userEmail = currentSession.getIdToken().payload.email;
    const members = await Api.get(`/members?email_address=${userEmail}`);
    const member: IMember = members.find(
      (it: IMember) => it.email_address === userEmail
    );
    const orgMembers = await Api.get('/org_members');
    const toBeDelOrgMember = orgMembers.find(
      (it: IOrgMember) =>
        it.member_id === member.member_id && it.org_id === organization.org_id
    );

    if (toBeDelOrgMember?.org_member_id)
      await Api.delete(
        `/org_members?org_member_id=${toBeDelOrgMember.org_member_id}`
      );

    if (organization.created_by === member.member_id) {
      await Api.delete(`/organizations?org_id=${organization.org_id}`);
    }

    dispatch({
      type: DELETE_ORGANIZATION_SUCCESS,
      payload: {
        organization,
      },
    });

    Toasts.successToast('Changes successfully saved.');
  } catch {
    dispatch({
      type: DELETE_ORGANIZATION_FAILURE,
    });
  }
};

export {
  loadOrganizations,
  createOrganization,
  addUserToOrganization,
  deleteOrganization,
};
