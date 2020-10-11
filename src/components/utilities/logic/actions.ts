import { Dispatch } from 'redux';
import { Auth } from 'aws-amplify';
import {
  LOAD_USER_DATA_START,
  LOAD_USER_DATA_SUCCESS,
  LOAD_USER_DATA_FAILURE,
  SAVE_USER_DATA_SUCCESS,
  SAVE_USER_DATA_FAILURE,
  CHANGE_USER,
} from './action-types';
import { AppState } from './reducer';
import Api from 'api/api';
import { memberSchema } from 'validations';
import { Toasts } from 'components/common';
import { IMember } from 'common/models';
import { IUtilitiesMember } from '../types';

type IAppState = {
  utilities: AppState;
};

const loadUserData = () => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_USER_DATA_START,
    });

    const currentSession = await Auth.currentSession();
    const userEmail = currentSession.getIdToken().payload.email;
    const members = await Api.get(`/members?email_address=${userEmail}`);
    const member: IMember = members.find(
      (it: IMember) => it.email_address === userEmail
    );

    dispatch({
      type: LOAD_USER_DATA_SUCCESS,
      payload: {
        userData: member,
      },
    });
  } catch {
    dispatch({
      type: LOAD_USER_DATA_FAILURE,
    });
  }
};

const saveUserData = () => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  try {
    const { userData } = getState().utilities;

    if (userData && !userData.isChange) {
      return;
    }

    const copiedUser = { ...userData } as IUtilitiesMember;

    delete copiedUser?.isChange;

    await memberSchema.validate(copiedUser);

    Api.put(`/members?member_id=${copiedUser.member_id}`, copiedUser);

    dispatch({
      type: SAVE_USER_DATA_SUCCESS,
    });

    Toasts.successToast('User saved successfully');
  } catch (err) {
    dispatch({
      type: SAVE_USER_DATA_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

const changeUser = (userNewField: Partial<IUtilitiesMember>) => ({
  type: CHANGE_USER,
  payload: {
    userNewField: {
      ...userNewField,
      isChange: true,
    },
  },
});

export { loadUserData, saveUserData, changeUser };
