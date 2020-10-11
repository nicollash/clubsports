import {
  IDivision,
  ITeam,
  IFacility,
  IEventDetails,
  IField,
  ISchedule,
  IPool,
  ISchedulesGame,
} from 'common/models';
import { IBracketGame } from 'components/playoffs/bracketGames';

const LOAD_REPORTING_DATA_START = 'LOAD_REPORTING_DATA_START';
const LOAD_REPORTING_DATA_SUCCESS = 'LOAD_REPORTING_DATA_SUCCESS';
const LOAD_REPORTING_DATA_FAILURE = 'LOAD_REPORTING_DATA_FAILURE';

export interface LoadReportingDataStart {
  type: 'LOAD_REPORTING_DATA_START';
}

export interface LoadReportingDataSuccess {
  type: 'LOAD_REPORTING_DATA_SUCCESS';
  payload: {
    event: IEventDetails;
    facilities: IFacility[];
    fields: IField[];
    divisions: IDivision[];
    teams: ITeam[];
    schedule: ISchedule;
    schedulesGames: ISchedulesGame[];
    pools: IPool[];
    bracketGames: IBracketGame[];
  };
}

export type ReportingAction = LoadReportingDataStart | LoadReportingDataSuccess;

export {
  LOAD_REPORTING_DATA_START,
  LOAD_REPORTING_DATA_SUCCESS,
  LOAD_REPORTING_DATA_FAILURE,
};
