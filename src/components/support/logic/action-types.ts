import { IMember } from 'common/models';

const LOAD_USER_DATA_START = 'SUPPORT:LOAD_USER_DATA_START';
const LOAD_USER_DATA_SUCCESS = 'SUPPORT:LOAD_USER_DATA_SUCCESS';
const LOAD_USER_DATA_FAILURE = 'SUPPORT:LOAD_USER_DATA_FAILURE';


interface LoadUserDataStart {
  type: 'SUPPORT:LOAD_USER_DATA_START';
}

interface LoadUserDataSuccess {
  type: 'SUPPORT:LOAD_USER_DATA_SUCCESS';
  payload: {
    userData: IMember;
  };
}


export type UtilitiesAction =
  | LoadUserDataStart
  | LoadUserDataSuccess;

export {
  LOAD_USER_DATA_START,
  LOAD_USER_DATA_SUCCESS,
  LOAD_USER_DATA_FAILURE,
};
