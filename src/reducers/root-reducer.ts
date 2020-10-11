import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import history from '../browserhistory';
import pageEvent from 'components/authorized-page/authorized-page-event/logic/reducer';
import facilities from 'components/facilities/logic/reducer';
import {event, organizations} from 'components/event-details/logic/reducer';
import events from 'components/dashboard/logic/reducer';
import registration from '../components/registration/registration-edit/logic/reducer';
import promoCodes from '../components/registration/registration-edit/promo-codes/logic/reducer';
import divisions from 'components/divisions-and-pools/logic/reducer';
import calendar from 'components/calendar/logic/reducer';
import scoring from 'components/scoring/logic/reducer';
import scheduling from 'components/scheduling/logic/reducer';
import teams from 'components/teams/logic/reducer';
import recordScores from 'components/scoring/pages/record-scores/logic/reducer';
import organizationsManagement from 'components/organizations-management/logic/reducer';
import libraryManager from 'components/library-manager/logic/reducer';
import utilities from 'components/utilities/logic/reducer';
import orgInfo from 'components/my-organizations/logic/reducer';
import support from 'components/support/logic';
import complexities from 'components/gameday-complexities/logic/reducer';
import schedules from 'components/schedules/logic/reducer';
import schedulesTable from 'components/schedules/logic/schedules-table/schedulesTableReducer';
import tableColumns from 'components/common/csv-loader/logic/reducer';
import reporting from 'components/reporting/logic/reducer';
import eventLink from 'components/event-link/logic/reducer';
import playoffs from 'components/playoffs/logic/reducer';
import playerStatsReducer from 'components/register-page/individuals/player-stats/logic/reducer';
import regTeams from 'components/register-page/teams/logic/reducer';
import reports from 'components/reports/logic/reducer';

const rootReducer = combineReducers({
  router: connectRouter(history),
  pageEvent,
  facilities,
  event,
  events,
  registration,
  promoCodes,
  divisions,
  calendar,
  scoring,
  recordScores,
  scheduling,
  organizations,
  schedules,
  teams,
  organizationsManagement,
  libraryManager,
  utilities,
  orgInfo,
  support,
  complexities,
  schedulesTable,
  tableColumns,
  reporting,
  eventLink,
  playoffs,
  playerStatsReducer,
  regTeams,
  reports,
});

export default rootReducer;
