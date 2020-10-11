const LOAD_ORGANIZATION = 'UTILITIES/LOAD_ORGANIZATION';
const LOAD_ORGANIZATION_SUCCESS = 'UTILITIES/LOAD_ORGANIZATION_SUCCESS';
const LOAD_ORGANIZATION_FAILURE = 'UTILITIES/LOAD_ORGANIZATION_FAILURE';

const LOAD_STATEGROUP = 'UTILITIES/LOAD_STATEGROUP';
const LOAD_STATEGROUP_SUCCESS = 'UTILITIES/LOAD_STATEGROUP_SUCCESS';
const LOAD_STATEGROUP_FAILURE = 'UTILITIES/LOAD_STATEGROUP_FAILURE';

interface LoadOrganization {
  type: 'UTILITIES/LOAD_ORGANIZATION';
}

interface LoadOrganizationSuccess {
  type: 'UTILITIES/LOAD_ORGANIZATION_SUCCESS';
  payload: {
    orgList: any,
  };
}

interface LoadOrganizationFailure {
  type: 'UTILITIES/LOAD_ORGANIZATION_FAILURE';
}

interface LoadStateGroup {
  type: 'UTILITIES/LOAD_STATEGROUP';
}

interface LoadStateGroupSuccess {
  type: 'UTILITIES/LOAD_STATEGROUP_SUCCESS';
  payload: {
    stateGroup: any,
  };
}

interface LoadStateGroupFailure {
  type: 'UTILITIES/LOAD_STATEGROUP_FAILURE';
}

export type OrgAction =
  | LoadOrganization
  | LoadOrganizationSuccess
  | LoadOrganizationFailure
  | LoadStateGroup
  | LoadStateGroupSuccess
  | LoadStateGroupFailure;

export {
  LOAD_ORGANIZATION,
  LOAD_ORGANIZATION_SUCCESS,
  LOAD_ORGANIZATION_FAILURE,
  LOAD_STATEGROUP,
  LOAD_STATEGROUP_SUCCESS,
  LOAD_STATEGROUP_FAILURE,
};
