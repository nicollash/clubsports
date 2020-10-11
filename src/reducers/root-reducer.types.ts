import { IPageEventState } from 'components/authorized-page/authorized-page-event/logic/reducer';
import { IEventState, IOrganizationState } from 'components/event-details/logic/reducer';
import { IFacilitiesState } from 'components/facilities/logic/reducer';
import { IDivisionAndPoolsState } from 'components/divisions-and-pools/logic/reducer';
import { ISchedulesState } from 'components/schedules/logic/reducer';
import { ISchedulingState } from 'components/scheduling/logic/reducer';
import { ISchedulesTableState } from 'components/schedules/logic/schedules-table/schedulesTableReducer';
import { IRecordScoresState } from 'components/scoring/pages/record-scores/logic/reducer';
import { ILibraryManagerState } from 'components/library-manager/logic/reducer';
import { IReportingState } from 'components/reporting/logic/reducer';
import { ITeamsState } from 'components/teams/logic/reducer';
import { IScoringState } from 'components/scoring/logic/reducer';
import { ICalendarState } from 'components/calendar/logic/reducer';
import { IPlayoffState } from 'components/playoffs/logic/reducer';
import { IGamedayComplexitiesState } from 'components/gameday-complexities/logic/reducer';

export interface IAppState {
  pageEvent: IPageEventState;
  event: IEventState;
  organizations: IOrganizationState;
  facilities: IFacilitiesState;
  divisions: IDivisionAndPoolsState;
  schedules: ISchedulesState;
  scheduling: ISchedulingState;
  schedulesTable: ISchedulesTableState;
  recordScores: IRecordScoresState;
  libraryManager: ILibraryManagerState;
  reporting: IReportingState;
  teams: ITeamsState;
  scoring: IScoringState;
  calendar: ICalendarState;
  playoffs: IPlayoffState;
  complexities: IGamedayComplexitiesState;
  isLoadingNames: boolean;
}
