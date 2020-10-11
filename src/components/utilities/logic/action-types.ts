import { IMember } from 'common/models';
import { IUtilitiesMember } from '../types';

const LOAD_USER_DATA_START = 'UTILITIES:LOAD_USER_DATA_START';
const LOAD_USER_DATA_SUCCESS = 'UTILITIES:LOAD_USER_DATA_SUCCESS';
const LOAD_USER_DATA_FAILURE = 'UTILITIES:LOAD_USER_DATA_FAILURE';

const SAVE_USER_DATA_SUCCESS = 'UTILITIES:SAVE_USER_DATA_SUCCESS';
const SAVE_USER_DATA_FAILURE = 'UTILITIES:SAVE_USER_DATA_FAILURE';

const CHANGE_USER = 'UTILITIES:CHANGE_USER';

interface LoadUserDataStart {
  type: 'UTILITIES:LOAD_USER_DATA_START';
}

interface LoadUserDataSuccess {
  type: 'UTILITIES:LOAD_USER_DATA_SUCCESS';
  payload: {
    userData: IMember;
  };
}

interface saveUserDataSuccess {
  type: 'UTILITIES:SAVE_USER_DATA_SUCCESS';
  payload: {
    userData: IMember;
  };
}

interface changeUser {
  type: 'UTILITIES:CHANGE_USER';
  payload: {
    userNewField: Partial<IUtilitiesMember>;
  };
}

export type UtilitiesAction =
  | LoadUserDataStart
  | LoadUserDataSuccess
  | saveUserDataSuccess
  | changeUser;

export {
  LOAD_USER_DATA_START,
  LOAD_USER_DATA_SUCCESS,
  LOAD_USER_DATA_FAILURE,
  SAVE_USER_DATA_SUCCESS,
  SAVE_USER_DATA_FAILURE,
  CHANGE_USER,
};
