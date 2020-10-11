import { IOrganization } from 'common/models';

export const LOAD_ORGANIZATIONS_START =
  'ORGANIZATIONS_MANAGEMENT:LOAD_ORGANIZATIONS_START';
export const LOAD_ORGANIZATIONS_SUCCESS =
  'ORGANIZATIONS_MANAGEMENT:LOAD_ORGANIZATIONS_SUCCESS';
export const LOAD_ORGANIZATIONS_FAILURE =
  'ORGANIZATIONS_MANAGEMENT:LOAD_ORGANIZATIONS_FAILURE';

export const CREATE_ORGANIZATION_SUCCESS =
  'ORGANIZATIONS_MANAGEMENT:CREATE_ORGANIZATION_SUCCESS';
export const CREATE_ORGANIZATION_FAILURE =
  'ORGANIZATIONS_MANAGEMENT:CREATE_ORGANIZATION_FAILURE';

export const ADD_USER_TO_ORGANIZATION_SUCCESS =
  'ORGANIZATIONS_MANAGEMENT:ADD_USER_TO_ORGANIZATION_SUCCESS';
export const ADD_USER_TO_ORGANIZATION_FAILURE =
  'ORGANIZATIONS_MANAGEMENT:ADD_USER_TO_ORGANIZATION_FAILURE';

export const DELETE_ORGANIZATION_SUCCESS =
  'ORGANIZATIONS_MANAGEMENT:DELETE_ORGANIZATION_SUCCESS';
export const DELETE_ORGANIZATION_FAILURE =
  'ORGANIZATIONS_MANAGEMENT:DELETE_ORGANIZATION_FAILURE';

export interface loadOrganizationsStart {
  type: 'ORGANIZATIONS_MANAGEMENT:LOAD_ORGANIZATIONS_START';
}

export interface loadOrganizationsSuccess {
  type: 'ORGANIZATIONS_MANAGEMENT:LOAD_ORGANIZATIONS_SUCCESS';
  payload: {
    organizations: IOrganization[];
  };
}

export interface createOrganizationSuccess {
  type: 'ORGANIZATIONS_MANAGEMENT:CREATE_ORGANIZATION_SUCCESS';
  payload: {
    organization: IOrganization;
  };
}

export interface addUserToOrganizationSuccess {
  type: 'ORGANIZATIONS_MANAGEMENT:ADD_USER_TO_ORGANIZATION_SUCCESS';
  payload: {
    organization: IOrganization;
  };
}

export interface deleteOrganizationSuccess {
  type: 'ORGANIZATIONS_MANAGEMENT:DELETE_ORGANIZATION_SUCCESS';
  payload: {
    organization: IOrganization;
  };
}

export type organizationManagementAction =
  | loadOrganizationsSuccess
  | loadOrganizationsStart
  | createOrganizationSuccess
  | addUserToOrganizationSuccess
  | deleteOrganizationSuccess;
