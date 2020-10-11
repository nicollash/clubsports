import {
  LOAD_REPORTS_SUCCESS,
  LOAD_REPORTS_START,
  ADD_REPORT_SUCCESS,
  DELETE_REPORT_SUCCESS,
  UPDATE_REPORT_SUCCESS,
  ReportsAction,
} from './action-types';
import { IReport } from 'common/models';

export interface IReportsState {
  reports: IReport[];
  isLoading: boolean;
  isLoaded: boolean;
}

const initialState = {
  reports: [],
  isLoading: false,
  isLoaded: false,
};

const reportsReducer = (
  state: IReportsState = initialState,
  action: ReportsAction
) => {
  switch (action.type) {
    case LOAD_REPORTS_START: {
      return { ...initialState, isLoading: true };
    }

    case LOAD_REPORTS_SUCCESS: {
      const { reports } = action.payload;

      return {
        ...state,
        reports,
        isLoading: false,
        isLoaded: true,
      };
    }

    case ADD_REPORT_SUCCESS: {
      const report = action.payload;

      const updatedReports = [...state.reports, report];

      return {
        ...state,
        reports: updatedReports,
        isLoading: false,
      };
    }

    case UPDATE_REPORT_SUCCESS: {
      const report = action.payload;

      const updatedReports = state.reports.map(rep =>
        rep.report_id === report.report_id ? report : rep
      );

      return {
        ...state,
        reports: updatedReports,
        isLoading: false,
      };
    }

    case DELETE_REPORT_SUCCESS: {
      const reportId = action.payload;

      const updatedReports = state.reports.filter(
        rep => rep.report_id !== reportId
      );

      return {
        ...state,
        reports: updatedReports,
        isLoading: false,
      };
    }

    default:
      return state;
  }
};

export default reportsReducer;
