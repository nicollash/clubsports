import {
  LOAD_PROMO_CODES_SUCCESS,
  LOAD_PROMO_CODES_START,
  ADD_PROMO_CODE_SUCCESS,
  DELETE_PROMO_CODE_SUCCESS,
  UPDATE_PROMO_CODE_SUCCESS,
  PromoCodesAction,
} from './action-types';
import { IPromoCode } from 'common/models';

export interface IPromoCodesState {
  promoCodes: IPromoCode[] | null;
  isLoading: boolean;
  isLoaded: boolean;
}

const initialState = {
  promoCodes: null,
  isLoading: false,
  isLoaded: false,
};

const promoCodesReducer = (
  state: IPromoCodesState = initialState,
  action: PromoCodesAction
) => {
  switch (action.type) {
    case LOAD_PROMO_CODES_START: {
      return { ...initialState, isLoading: true };
    }

    case LOAD_PROMO_CODES_SUCCESS: {
      const { promoCodes } = action.payload;

      return {
        ...state,
        promoCodes,
        isLoading: false,
        isLoaded: true,
      };
    }

    case ADD_PROMO_CODE_SUCCESS: {
      const promoCode = action.payload;

      const updatedReports = [...state.promoCodes, promoCode];

      return {
        ...state,
        promoCodes: updatedReports,
        isLoading: false,
      };
    }

    case UPDATE_PROMO_CODE_SUCCESS: {
      const promoCode = action.payload;

      const updatedPromoCodes = state.promoCodes!.map(rep =>
        rep.promo_code_id === promoCode.promo_code_id ? promoCode : rep
      );

      return {
        ...state,
        promoCodes: updatedPromoCodes,
        isLoading: false,
      };
    }

    case DELETE_PROMO_CODE_SUCCESS: {
      const promoCodeId = action.payload;

      const updatedReports = state.promoCodes!.filter(
        rep => rep.promo_code_id !== promoCodeId
      );

      return {
        ...state,
        promoCodes: updatedReports,
        isLoading: false,
      };
    }

    default:
      return state;
  }
};

export default promoCodesReducer;
