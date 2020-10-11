import { EventMenu } from './constants';
import {
  LOAD_AUTH_PAGE_DATA_START,
  LOAD_AUTH_PAGE_DATA_SUCCESS,
  CLEAR_AUTH_PAGE_DATA,
  PUBLISH_EVENT_SUCCESS,
  AuthPageAction,
  PUBLISH_GAMECOUNT_SUCCESS,
  ADD_TEAMS_IN_PROGRESS,
  ADD_TEAMS_SUCCESS,
  ADD_TEAMS_FAILURE,
} from './action-types';
import {
  EVENT_DETAILS_FETCH_SUCCESS,
  EventDetailsAction,
} from 'components/event-details/logic/actionTypes';
import {
  REGISTRATION_UPDATE_SUCCESS,
  RegistrationAction,
} from 'components/registration/registration-edit/logic/actionTypes';
import {
  LOAD_FACILITIES_SUCCESS,
  SAVE_FACILITIES_SUCCESS,
  FacilitiesAction,
} from 'components/facilities/logic/action-types';
import {
  UPDATE_TEAMS_SUCCESS,
  DIVISIONS_TEAMS_FETCH_SUCCESS,
  DivisionsPoolsAction,
} from 'components/divisions-and-pools/logic/actionTypes';
import {
  LOAD_TEAMS_DATA_SUCCESS,
  TeamsAction,
  SAVE_TEAMS_SUCCESS,
} from 'components/teams/logic/action-types';
import {
  FETCH_FIELDS_SUCCESS,
  FETCH_FIELDS_FAILURE,
  FieldsAction,
} from 'components/schedules/logic/actionTypes';
import {
  SCHEDULE_FETCH_SUCCESS,
  FETCH_BRACKETS_SUCCESS,
  ScheduleActionType,
} from 'components/scheduling/logic/actionTypes';
import { sortTitleByField } from 'helpers';
import { IMenuItem, ITournamentData } from 'common/models';
import {
  EventMenuTitles,
  EventMenuRegistrationTitles,
  SortByFilesTypes,
} from 'common/enums';
import { CheckIsCompleted } from '../../helpers';
import { mapSchedulingScheduleData } from 'components/schedules/mapScheduleData';

export interface IPageEventState {
  isLoading: boolean;
  isLoaded: boolean;
  gameCount: {
    poolLength: number;
    bracketLength: number;
  };
  menuList: IMenuItem[];
  tournamentData: ITournamentData;
}

const initialState = {
  isLoading: false,
  isLoaded: false,
  gameCount: {
    poolLength: 0,
    bracketLength: 0,
  },
  menuList: EventMenu,
  tournamentData: {
    event: null,
    registration: null,
    facilities: [],
    divisions: [],
    schedules: [],
    teams: [],
    fields: [],
    brackets: [],
  },
};

const pageEventReducer = (
  state: IPageEventState = initialState,
  action:
    | AuthPageAction
    | EventDetailsAction
    | FacilitiesAction
    | DivisionsPoolsAction
    | RegistrationAction
    | TeamsAction
    | FieldsAction
    | ScheduleActionType
) => {
  switch (action.type) {
    case LOAD_AUTH_PAGE_DATA_START: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case LOAD_AUTH_PAGE_DATA_SUCCESS: {
      const { tournamentData } = action.payload;
      const {
        event,
        registration,
        facilities,
        divisions,
        teams,
        schedules,
      } = tournamentData;

      return {
        ...state,
        tournamentData,
        isLoaded: true,
        isLoading: false,
        menuList: state.menuList.map(item => {
          switch (item.title) {
            case EventMenuTitles.EVENT_DETAILS: {
              return {
                ...item,
                isCompleted: CheckIsCompleted.checkIsCompletedEvent(event),
              };
            }
            case EventMenuTitles.FACILITIES: {
              return {
                ...item,
                isCompleted: CheckIsCompleted.checkIsCompletedFacilities(
                  facilities
                ),
                children: sortTitleByField(
                  facilities,
                  SortByFilesTypes.FACILITIES
                ),
              };
            }
            case EventMenuTitles.REGISTRATION: {
              return {
                ...item,
                isCompleted:
                  CheckIsCompleted.checkIsCompletedRegistration(registration) ||
                  event?.no_registrations_YN === 1,
                children:
                  registration && event !== null
                    ? Object.values(EventMenuRegistrationTitles).filter(
                        title =>
                          title !== EventMenuRegistrationTitles.WAIVER ||
                          event.waivers_required === 1
                      )
                    : [],
              };
            }
            case EventMenuTitles.DIVISIONS_AND_POOLS: {
              return {
                ...item,
                isCompleted: CheckIsCompleted.checkIsCompletedDivisions(
                  divisions
                ),
                children: sortTitleByField(
                  divisions,
                  SortByFilesTypes.DIVISIONS
                ),
              };
            }
            case EventMenuTitles.TEAMS: {
              return {
                ...item,
                isCompleted: CheckIsCompleted.checkIsCompletedTeams(teams),
              };
            }
            case EventMenuTitles.SCHEDULING:
            case EventMenuTitles.SCORING: {
              return {
                ...item,
                isCompleted: CheckIsCompleted.checkIsCompletedSchedules(
                  schedules
                ),
              };
            }
            default:
              return item;
          }
        }),
      };
    }
    case EVENT_DETAILS_FETCH_SUCCESS: {
      const events = action.payload;

      return {
        ...state,
        tournamentData: {
          ...state.tournamentData,
          event: events[0],
        },
      };
    }
    case PUBLISH_GAMECOUNT_SUCCESS: {
      const gameCount = action.payload;
      return {
        ...state,
        gameCount: gameCount,
      };
    }
    case REGISTRATION_UPDATE_SUCCESS: {
      const registration = action.payload;
      const event = action.event && action.event[0];

      return {
        ...state,
        menuList: state.menuList.map(item =>
          item.title === EventMenuTitles.REGISTRATION
            ? {
                ...item,
                isCompleted:
                  CheckIsCompleted.checkIsCompletedRegistration(registration) ||
                  event?.no_registrations_YN === 1,
                children: registration
                  ? Object.values(EventMenuRegistrationTitles).filter(title => title !== EventMenuRegistrationTitles.WAIVER || event?.waivers_required === 1)
                  : [],
              }
            : item
        ),
      };
    }
    case LOAD_FACILITIES_SUCCESS: {
      const { facilities } = action.payload;

      return {
        ...state,
        menuList: state.menuList.map(item =>
          item.title === EventMenuTitles.FACILITIES
            ? {
                ...item,
                isCompleted: CheckIsCompleted.checkIsCompletedFacilities(
                  facilities
                ),
                children: sortTitleByField(
                  facilities,
                  SortByFilesTypes.FACILITIES
                ),
              }
            : item
        ),
        tournamentData: {
          ...state.tournamentData,
          facilities,
        },
      };
    }
    case SAVE_FACILITIES_SUCCESS: {
      const { fields } = action.payload;

      return {
        ...state,
        tournamentData: {
          ...state.tournamentData,
          fields,
        },
      };
    }
    case DIVISIONS_TEAMS_FETCH_SUCCESS: {
      const { divisions, teams } = action.payload;

      return {
        ...state,
        menuList: state.menuList.map(item =>
          item.title === EventMenuTitles.DIVISIONS_AND_POOLS
            ? {
                ...item,
                isCompleted: CheckIsCompleted.checkIsCompletedDivisions(
                  divisions
                ),
                children: sortTitleByField(
                  divisions,
                  SortByFilesTypes.DIVISIONS
                ),
              }
            : item
        ),
        tournamentData: { ...state.tournamentData, divisions, teams },
      };
    }
    case LOAD_TEAMS_DATA_SUCCESS:
    case UPDATE_TEAMS_SUCCESS: {
      const { teams } = action.payload;

      return {
        ...state,
        menuList: state.menuList.map(item =>
          item.title === EventMenuTitles.TEAMS
            ? {
                ...item,
                isCompleted: CheckIsCompleted.checkIsCompletedTeams(teams),
              }
            : item
        ),
        tournamentData: { ...state.tournamentData, teams },
      };
    }
    case SAVE_TEAMS_SUCCESS: {
      const { teams } = action.payload;

      return {
        ...state,
        menuList: state.menuList.map(item =>
          item.title === EventMenuTitles.TEAMS
            ? {
                ...item,
                isCompleted: CheckIsCompleted.checkIsCompletedTeams(teams),
              }
            : item
        ),
        tournamentData: { ...state.tournamentData, teams },
      };
    }
    case SCHEDULE_FETCH_SUCCESS: {
      const { schedules } = action.payload;

      const mappedSchedles = schedules.map(schedule =>
        mapSchedulingScheduleData(schedule)
      );

      return {
        ...state,
        menuList: state.menuList.map(item =>
          item.title === EventMenuTitles.SCHEDULING ||
          item.title === EventMenuTitles.SCORING
            ? {
                ...item,
                isCompleted: CheckIsCompleted.checkIsCompletedSchedules(
                  schedules
                ),
              }
            : item
        ),
        tournamentData: {
          ...state.tournamentData,
          schedules: mappedSchedles,
        },
      };
    }
    case FETCH_BRACKETS_SUCCESS: {
      const brackets = action.payload;

      return {
        ...state,
        tournamentData: {
          ...state.tournamentData,
          brackets,
        },
      };
    }
    case PUBLISH_EVENT_SUCCESS: {
      const { event } = action.payload;

      return {
        ...state,
        tournamentData: {
          ...state.tournamentData,
          event,
        },
      };
    }
    case CLEAR_AUTH_PAGE_DATA: {
      return { ...initialState };
    }
    case FETCH_FIELDS_SUCCESS:
      return {
        ...state,
        tournamentData: {
          ...state.tournamentData,
          fields: action.payload,
        },
      };
    case FETCH_FIELDS_FAILURE:
      return {
        ...state,
        tournamentData: {
          ...state.tournamentData,
          fields: undefined,
        },
      };
    case ADD_TEAMS_IN_PROGRESS: 
      return state;
    case ADD_TEAMS_SUCCESS:
      return {
        ...state,
        tournamentData: {
          ...state.tournamentData, teams: [...state.tournamentData.teams, ...action.payload.map(v => ({
            team_id: v.id,
            event_id: v.eventId,
            org_id: null,
            long_name: v.name,
            short_name: v.name,
            team_tag: null,
            city: null,
            state: null,
            level: null,
            contact_first_name: null,
            contact_last_name: null,
            phone_num: null,
            contact_email: null,
            schedule_restrictions: null,
            is_active_YN: 1,
            is_library_YN: null,
            division_id: v.divisionId,
            pool_id: v.poolId,
          }))]
        },
      };
    case ADD_TEAMS_FAILURE:
      return state;
    default:
      return state;
  }
};

export default pageEventReducer;
