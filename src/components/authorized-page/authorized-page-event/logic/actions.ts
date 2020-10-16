import { ActionCreator, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import api from "api/api";
import {
  AuthPageAction,
  LOAD_AUTH_PAGE_DATA_START,
  LOAD_AUTH_PAGE_DATA_SUCCESS,
  LOAD_AUTH_PAGE_DATA_FAILURE,
  CLEAR_AUTH_PAGE_DATA,
  PUBLISH_EVENT_SUCCESS,
  PUBLISH_EVENT_FAILURE,
  PUBLISH_GAMECOUNT_SUCCESS,
  ADD_ENTITY_TO_LIBRARY_SUCCESS,
  ADD_ENTITY_TO_LIBRARY_FAILURE,
  ADD_ENTITIES_TO_LIBRARY_SUCCESS,
  ADD_ENTITIES_TO_LIBRARY_FAILURE,
  ADD_TEAMS_IN_PROGRESS,
  ADD_TEAMS_SUCCESS,
  ADD_TEAMS_FAILURE,
} from "./action-types";
import { IAppState } from "reducers/root-reducer.types";
import Api from "api/api";
import { Toasts } from "components/common";
import {
  IEventDetails,
  IRegistration,
  IFacility,
  IPublishSettings,
  ISchedule,
  IFetchedBracket,
} from "common/models";
import {
  EventStatuses,
  EntryPoints,
  MethodTypes,
  LibraryStates,
  EventPublishTypes,
  EventModifyTypes,
  MobileEventStatuses,
} from "common/enums";
import { IEntity } from "common/types";
import {
  sentToServerByRoute,
  removeObjKeysByEntryPoint,
  CheckEventDrafts,
  updateMobileEventStatus,
} from "helpers";
import {
  updateScheduleStatus,
  updateBracketStatus,
} from "components/scheduling/logic/actions";
import { ITeam } from "common/models/schedule/teams";
import chunk from "lodash-es/chunk";

const loadAuthPageData: ActionCreator<ThunkAction<
  void,
  {},
  null,
  AuthPageAction
>> = (eventId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_AUTH_PAGE_DATA_START,
    });

    const events = await Api.get(`/events?event_id=${eventId}`);
    const registrations = await Api.get(`/registrations?event_id=${eventId}`);
    const facilities = await Api.get(`/facilities?event_id=${eventId}`);
    const divisions = await Api.get(`/divisions?event_id=${eventId}`);
    const teams = await Api.get(`/teams?event_id=${eventId}`);
    const fields = (
      await Promise.all(
        facilities.map((it: IFacility) =>
          Api.get(`/fields?facilities_id=${it.facilities_id}`)
        )
      )
    ).flat();
    const schedules = await Api.get(`/schedules?event_id=${eventId}`);
    const brackets = await Api.get(`/brackets?event_id=${eventId}`);

    const currentEvent = events.find(
      (it: IEventDetails) => it.event_id === eventId
    );

    const currentRegistration = registrations.find(
      (it: IRegistration) => it.event_id === eventId
    );

    dispatch({
      type: LOAD_AUTH_PAGE_DATA_SUCCESS,
      payload: {
        teams: {
          teams,
        },
        tournamentData: {
          event: currentEvent,
          registration: currentRegistration,
          facilities,
          fields,
          divisions,
          teams,
          schedules,
          brackets,
        },
      },
    });
  } catch (err) {
    dispatch({
      type: LOAD_AUTH_PAGE_DATA_FAILURE,
    });
  }
};

export const loadGameCount: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId: string) => async (dispatch: Dispatch) => {
  const games = await api.get(`/event_game_ids?event_id=${eventId}`);
  const poolLength = games?.filter(
    ({ game_type }: { game_type: string }) => game_type === "Pool Play"
  ).length;
  const bracketLength = games?.filter(
    ({ game_type }: { game_type: string }) => game_type === "Bracket"
  ).length;

  dispatch({
    type: PUBLISH_GAMECOUNT_SUCCESS,
    payload: {
      poolLength,
      bracketLength,
    },
  });
};

const clearAuthPageData = () => ({
  type: CLEAR_AUTH_PAGE_DATA,
});

const updateEventStatus = (isDraft: boolean) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  const { tournamentData } = getState().pageEvent;
  const { event } = tournamentData;

  try {
    const updatedEvent = {
      ...event,
      is_published_YN: isDraft ? EventStatuses.Draft : EventStatuses.Published,
    } as IEventDetails;

    await Api.put(`/events?event_id=${updatedEvent.event_id}`, updatedEvent);

    dispatch({
      type: PUBLISH_EVENT_SUCCESS,
      payload: {
        event: updatedEvent,
      },
    });

    Toasts.successToast("Event changes successfully saved.");
  } catch {
    dispatch({
      type: PUBLISH_EVENT_FAILURE,
    });

    Toasts.errorToast(
      "Could not update event status. Please, try to reload the page."
    );
  }
};

const publishEventData = (
  publishType: EventPublishTypes,
  modifyModValue: EventModifyTypes,
  publishSettings: IPublishSettings,
  publishWithUnassignedGames?: boolean,
) => async (dispatch: Dispatch, getState: () => IAppState) => {
  const { tournamentData } = getState().pageEvent;
  const { event, schedules } = tournamentData;
  const hasPublishedEvent = !CheckEventDrafts.checkDraftEvent(
    event as IEventDetails
  );
  const hasPublishedSchedule = !CheckEventDrafts.checkDraftSchedule(schedules);

  const isDraft = modifyModValue === EventModifyTypes.UNPUBLISH;

  switch (publishType) {
    case EventPublishTypes.DETAILS: {
      dispatch<any>(updateEventStatus(isDraft));

      await updateMobileEventStatus(
        event!.event_id,
        MobileEventStatuses.EVENT,
        isDraft
      );

      break;
    }
    case EventPublishTypes.DETAILS_AND_TOURNAMENT_PLAY:
    case EventPublishTypes.TOURNAMENT_PLAY: {
      const publishedSchedule = publishSettings.activeSchedule as ISchedule;

      if (modifyModValue === EventModifyTypes.PUBLISH && !hasPublishedEvent) {
        dispatch<any>(updateEventStatus(isDraft));
      }

      dispatch<any>(
        updateScheduleStatus(publishedSchedule.schedule_id, isDraft)
      );

      await updateMobileEventStatus(
        event!.event_id,
        isDraft ? MobileEventStatuses.EVENT : MobileEventStatuses.EVENT_TP,
        isDraft
      );

      break;
    }

    case EventPublishTypes.DETAILS_AND_TOURNAMENT_PLAY_AND_BRACKETS:
    case EventPublishTypes.BRACKETS: {
      const publishedSchedule = publishSettings.activeSchedule as ISchedule;
      const publishedBracket = publishSettings.activeBracket as IFetchedBracket;

      if (modifyModValue === EventModifyTypes.PUBLISH && !hasPublishedEvent) {
        dispatch<any>(updateEventStatus(isDraft));
      }

      if (
        modifyModValue === EventModifyTypes.PUBLISH &&
        !hasPublishedSchedule
      ) {
        dispatch<any>(
          updateScheduleStatus(publishedSchedule.schedule_id, isDraft)
        );
      }

      dispatch<any>(updateBracketStatus(publishedBracket.bracket_id, isDraft, publishWithUnassignedGames));

      await updateMobileEventStatus(
        event!.event_id,
        isDraft
          ? MobileEventStatuses.EVENT_TP
          : MobileEventStatuses.EVENT_TP_BRACKETS,
        isDraft
      );
      break;
    }
  }
};

const addEntityToLibrary = (entity: IEntity, entryPoint: EntryPoints) => async (
  dispatch: Dispatch
) => {
  try {
    if (entity.is_library_YN === LibraryStates.TRUE) {
      throw new Error("The item is already in the library.");
    }

    const updatedEntity: IEntity = {
      ...entity,
      is_library_YN: LibraryStates.TRUE,
    };

    const clearEntity = removeObjKeysByEntryPoint(updatedEntity, entryPoint);

    await sentToServerByRoute(clearEntity, entryPoint, MethodTypes.PUT);

    dispatch({
      type: ADD_ENTITY_TO_LIBRARY_SUCCESS,
      payload: {
        entity: updatedEntity,
        entryPoint,
      },
    });

    Toasts.successToast("Changes successfully saved.");
  } catch (err) {
    dispatch({
      type: ADD_ENTITY_TO_LIBRARY_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

const addEntitiesToLibrary = (
  entities: IEntity[],
  entryPoint: EntryPoints
) => async (dispatch: Dispatch) => {
  try {
    const updatedEntities = entities.map((entity) => ({
      ...entity,
      is_library_YN: LibraryStates.TRUE,
    }));

    const clearEntities = updatedEntities.map((entity) =>
      removeObjKeysByEntryPoint(entity, entryPoint)
    );

    await Promise.all(
      clearEntities.map((entity) =>
        sentToServerByRoute(entity, entryPoint, MethodTypes.PUT)
      )
    );

    dispatch({
      type: ADD_ENTITIES_TO_LIBRARY_SUCCESS,
      payload: {
        entities: updatedEntities,
        entryPoint,
      },
    });

    Toasts.successToast("Changes successfully saved.");
  } catch (err) {
    dispatch({
      type: ADD_ENTITIES_TO_LIBRARY_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

const addTeams = (teams: ITeam[]) => async (dispatch: Dispatch) => {
  dispatch({
    type: ADD_TEAMS_IN_PROGRESS,
  });

  const teamsChunks = chunk(teams, 50);
  const teamsResponses = await Promise.all(
    teamsChunks.map(
      async (arr) =>
        await api.post(
          "/teams",
          arr.map((v) => ({
            team_id: v.id,
            long_name: v.name,
            short_name: v.name,
            event_id: v.eventId || null,
            division_id: v.divisionId || null,
            pool_id: v.poolId || null,
          }))
        )
    )
  );

  const teamsResponsesOk = teamsResponses.every((item) => item);

  if (teamsResponsesOk) {
    dispatch({
      type: ADD_TEAMS_SUCCESS,
      payload: teams,
    });
    return;
  }

  dispatch({
    type: ADD_TEAMS_FAILURE,
  });
};

export {
  loadAuthPageData,
  clearAuthPageData,
  publishEventData,
  addEntityToLibrary,
  addEntitiesToLibrary,
  addTeams,
};
