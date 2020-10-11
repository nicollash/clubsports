import { ThunkAction } from 'redux-thunk';
import { ActionCreator, Dispatch } from 'redux';
import Api from 'api/api';
import { IPromoCode } from 'common/models';
import { Toasts } from 'components/common';
import { getVarcharEight } from 'helpers';
import {
  LOAD_PROMO_CODES_FAILURE,
  LOAD_PROMO_CODES_SUCCESS,
  LOAD_PROMO_CODES_START,
  ADD_PROMO_CODE_SUCCESS,
  ADD_PROMO_CODE_FAILURE,
  DELETE_PROMO_CODE_SUCCESS,
  DELETE_PROMO_CODE_FAILURE,
  UPDATE_PROMO_CODE_SUCCESS,
  UPDATE_PROMO_CODE_FAILURE,
  PromoCodesAction,
} from './action-types';

const loadPromoCodes: ActionCreator<ThunkAction<
  void,
  {},
  null,
  PromoCodesAction
>> = (registrationId?: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_PROMO_CODES_START,
    });

    const regQueryString = registrationId
      ? `?registration_id=${registrationId}`
      : '';

    const promoCodes = (await Api.get(`/promo_codes${regQueryString}`)).sort(
      (a: IPromoCode, b: IPromoCode) => b.percent_off - a.percent_off
    );

    dispatch({
      type: LOAD_PROMO_CODES_SUCCESS,
      payload: {
        promoCodes,
      },
    });
  } catch {
    dispatch({
      type: LOAD_PROMO_CODES_FAILURE,
    });
  }
};

const addPromoCodeSuccess = (
  payload: IPromoCode
): { type: string; payload: IPromoCode } => ({
  type: ADD_PROMO_CODE_SUCCESS,
  payload,
});

const updatePromoCodeSuccess = (
  payload: IPromoCode
): { type: string; payload: IPromoCode } => ({
  type: UPDATE_PROMO_CODE_SUCCESS,
  payload,
});

const deletePromoCodeSuccess = (
  payload: string
): { type: string; payload: string } => ({
  type: DELETE_PROMO_CODE_SUCCESS,
  payload,
});

const deletePromoCode: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (promoCodeId: string) => async (dispatch: Dispatch) => {
  try {
    const response = await Api.delete(
      `/promo_codes?promo_code_id=${promoCodeId}`
    );

    if (response?.errorType === 'Error') {
      return Toasts.errorToast("Couldn't delete a Promo Code");
    }

    dispatch(deletePromoCodeSuccess(promoCodeId));

    Toasts.successToast('Promo Code deleted');
  } catch (err) {
    dispatch({
      type: DELETE_PROMO_CODE_FAILURE,
    });
    Toasts.successToast(err.message);
  }
};

const addPromoCode: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (promoCode: IPromoCode) => async (dispatch: Dispatch) => {
  try {
    const data = {
      ...promoCode,
      promo_code_id: getVarcharEight(),
    };

    const response = await Api.post(`/promo_codes`, data);

    if (response?.errorType === 'Error') {
      return Toasts.errorToast("Couldn't save a promoCode");
    }

    dispatch(addPromoCodeSuccess(data));

    Toasts.successToast('Promo Code saved');
  } catch (err) {
    dispatch({
      type: ADD_PROMO_CODE_FAILURE,
    });
    Toasts.errorToast(err.message);
  }
};

const updatePromoCode: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (updatedPromoCode: IPromoCode) => async (dispatch: Dispatch) => {
  try {
    await Api.put(
      `/promo_codes?promo_code_id=${updatedPromoCode.promo_code_id}`,
      updatedPromoCode
    );

    dispatch(updatePromoCodeSuccess(updatedPromoCode));

    Toasts.successToast('Promo Code saved');
  } catch (err) {
    dispatch({
      type: UPDATE_PROMO_CODE_FAILURE,
    });
    Toasts.successToast(err.message);
  }
};

export { loadPromoCodes, deletePromoCode, updatePromoCode, addPromoCode };
