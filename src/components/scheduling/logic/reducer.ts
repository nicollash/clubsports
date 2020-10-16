import {
  ScheduleActionType,
  SCHEDULE_FETCH_SUCCESS,
  SCHEDULE_FETCH_FAILURE,
  SCHEDULE_FETCH_IN_PROGRESS,
  ADD_NEW_SCHEDULE,
  CHANGE_SCHEDULE,
  UPDATE_SCHEDULE_SUCCESS,
  DELETE_SCHEDULE_SUCCESS,
  ADD_NEW_BRACKET,
  FETCH_EVENT_BRACKETS,
  UPDATE_EXISTING_BRACKET,
  CHECK_UNASSIGNED_GAMES,
  CHECK_SAME_COACH_RESULT,
} from './actionTypes';
import {
  ADD_ENTITIES_TO_LIBRARY_SUCCESS,
  AuthPageAction,
} from 'components/authorized-page/authorized-page-event/logic/action-types';
import { IConfigurableSchedule, ISchedule } from 'common/models/schedule';
import { ISchedulingSchedule } from '../types';
import { IBracket, ISchedulingBracket } from 'common/models/playoffs/bracket';
import { EntryPoints } from 'common/enums';

export interface ISchedulingState {
  schedule: IConfigurableSchedule | null;
  schedules: ISchedulingSchedule[];
  sameCoachResult: any[];
  isLoading: boolean;
  isLoaded: boolean;
  error: boolean;
  bracket: IBracket | null;
  brackets: ISchedulingBracket[] | null;
  countUnassignedGames: number | null;
}

const appState: ISchedulingState = {
  schedule: null,
  schedules: [],
  sameCoachResult: [],
  countUnassignedGames: null,
  isLoading: false,
  isLoaded: false,
  error: false,
  bracket: null,
  brackets: null,
};

export default (
  state = appState,
  action: ScheduleActionType | AuthPageAction
) => {
  switch (action.type) {
    case SCHEDULE_FETCH_IN_PROGRESS: {
      return {
        ...appState,
        isLoading: true,
      };
    }
    case SCHEDULE_FETCH_SUCCESS: {
      const { schedules } = action.payload;

      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        schedules,
      };
    }
    case SCHEDULE_FETCH_FAILURE: {
      return {
        ...state,
        error: true,
        schedulingIsLoading: false,
      };
    }
    case ADD_NEW_SCHEDULE: {
      const { newSchedule } = action.payload;

      return {
        ...state,
        schedule: newSchedule,
      };
    }
    case CHANGE_SCHEDULE: {
      const { scheduleKey } = action.payload;

      return {
        ...state,
        schedule: {
          ...state.schedule,
          ...scheduleKey,
        },
      };
    }
    case UPDATE_SCHEDULE_SUCCESS: {
      const { schedule } = action.payload;

      return {
        ...state,
        schedules: state.schedules.map(it =>
          it.schedule_id === schedule.schedule_id ? schedule : it
        ),
      };
    }
    case DELETE_SCHEDULE_SUCCESS: {
      const { schedule } = action.payload;

      return {
        ...state,
        schedules: state.schedules.filter(
          it => it.schedule_id !== schedule.schedule_id
        ),
        brackets: state.brackets?.filter(
          it => it.scheduleId !== schedule.schedule_id
        ),
      };
    }
    case ADD_NEW_BRACKET:
      return {
        ...state,
        bracket: action.payload,
      };
    case UPDATE_EXISTING_BRACKET:
      return {
        ...state,
        bracket: {
          ...state.bracket,
          ...action.payload,
        },
      };
    case FETCH_EVENT_BRACKETS:
      return {
        ...state,
        brackets: action.payload,
      };
    case CHECK_SAME_COACH_RESULT:
      return {
        ...state,
        sameCoachResult: action.payload,
      };
    case CHECK_UNASSIGNED_GAMES:
      return {
        ...state,
        countUnassignedGames: action.payload,
      }
    case ADD_ENTITIES_TO_LIBRARY_SUCCESS: {
      const { entities, entryPoint } = action.payload;

      if (entryPoint === EntryPoints.SCHEDULES) {
        const updatedSchedules = entities as ISchedule[];

        const schedules = state.schedules.map(schedule => {
          const updatedSchedule = updatedSchedules.find(
            it => it.schedule_id === schedule.schedule_id
          );

          return updatedSchedule ? updatedSchedule : schedule;
        });

        return {
          ...state,
          schedules,
        };
      } else {
        return state;
      }
    }
    default:
      return state;
  }
};
