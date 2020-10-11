import { ThunkAction } from 'redux-thunk';
import { ActionCreator, Dispatch } from 'redux';
import Api from 'api/api';
import history from 'browserhistory';
import { IReport } from 'common/models';
import { Toasts } from 'components/common';
import { getVarcharEight } from 'helpers';
import {
  LOAD_REPORTS_FAILURE,
  LOAD_REPORTS_SUCCESS,
  LOAD_REPORTS_START,
  ADD_REPORT_SUCCESS,
  ADD_REPORT_FAILURE,
  DELETE_REPORT_SUCCESS,
  DELETE_REPORT_FAILURE,
  UPDATE_REPORT_SUCCESS,
  UPDATE_REPORT_FAILURE,
  ReportsAction,
} from './action-types';

const loadReports: ActionCreator<ThunkAction<
  void,
  {},
  null,
  ReportsAction
>> = () => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_REPORTS_START,
    });

    const [defaultReports, myReports] = await Promise.all([
      await Api.get(`/reports_config?is_default_YN=1`),
      await Api.get(`/reports_config?created_by=CLT4TZNX`),
    ]);

    const reports: IReport[] = defaultReports
      .concat(myReports)
      .filter(
        (report: IReport, index: number, self: IReport[]) =>
          index === self.findIndex(t => t.report_id === report.report_id)
      ) // Concatenate two arrays and remove duplicates
      .sort((a: IReport, b: IReport) => {
        if (a.is_favorite_YN! > b.is_favorite_YN!) return -1;
        if (a.is_favorite_YN! < b.is_favorite_YN!) return 1;
        if (a.report_name! < b.report_name!) return -1;
        if (a.report_name! > b.report_name!) return 1;
        return 0;
      }); // Sort by favorite then by name

    dispatch({
      type: LOAD_REPORTS_SUCCESS,
      payload: {
        reports,
      },
    });
  } catch {
    dispatch({
      type: LOAD_REPORTS_FAILURE,
    });
  }
};

const addReportSuccess = (
  payload: IReport
): { type: string; payload: IReport } => ({
  type: ADD_REPORT_SUCCESS,
  payload,
});

const updateReportSuccess = (
  payload: IReport
): { type: string; payload: IReport } => ({
  type: UPDATE_REPORT_SUCCESS,
  payload,
});

const deleteReportSuccess = (
  payload: string
): { type: string; payload: string } => ({
  type: DELETE_REPORT_SUCCESS,
  payload,
});

const deleteReport: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (reportId: string) => async (dispatch: Dispatch) => {
  try {
    const response = await Api.delete(`/reports_config?report_id=${reportId}`);

    if (response?.errorType === 'Error') {
      return Toasts.errorToast("Couldn't delete a report");
    }

    dispatch(deleteReportSuccess(reportId));

    history.goBack();

    Toasts.successToast('Report deleted');
  } catch (err) {
    dispatch({
      type: DELETE_REPORT_FAILURE,
    });
    Toasts.successToast(err.message);
  }
};

const addReport: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (report: IReport) => async (dispatch: Dispatch) => {
  try {
    const data = {
      ...report,
      report_id: getVarcharEight(),
    };

    const response = await Api.post(`/reports_config`, data);

    if (response?.errorType === 'Error') {
      return Toasts.errorToast("Couldn't save a report");
    }

    dispatch(addReportSuccess(data));

    Toasts.successToast('Report saved');
  } catch (err) {
    dispatch({
      type: ADD_REPORT_FAILURE,
    });
    Toasts.errorToast(err.message);
  }
};

const updateReport: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (updatedReport: IReport) => async (dispatch: Dispatch) => {
  try {
    await Api.put(
      `/reports_config?report_id=${updatedReport.report_id}`,
      updatedReport
    );

    dispatch(updateReportSuccess(updatedReport));

    Toasts.successToast('Report saved');
  } catch (err) {
    dispatch({
      type: UPDATE_REPORT_FAILURE,
    });
    Toasts.successToast(err.message);
  }
};

export { loadReports, deleteReport, updateReport, addReport };
