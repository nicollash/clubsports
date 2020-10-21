import { ThunkAction } from "redux-thunk";
import { ActionCreator, Dispatch } from "redux";
import {
  ReportingAction,
  LOAD_REPORTING_DATA_START,
  LOAD_REPORTING_DATA_SUCCESS,
  LOAD_REPORTING_DATA_FAILURE,
} from "./action-types";
import Api from "api/api";
import {
  IFacility,
  IEventDetails,
  ISchedule,
  IDivision,
  IFetchedBracket,
} from "common/models";
import { ScheduleStatuses, BracketStatuses } from "common/enums";
import { mapFetchedBracketGames } from "components/playoffs/mapBracketsData";
import { Toasts } from "components/common";

const loadReportingData: ActionCreator<ThunkAction<
  void,
  {},
  null,
  ReportingAction
>> = (eventId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_REPORTING_DATA_START,
    });

    const events = await Api.get(`/events?event_id=${eventId}`);
    const divisions = await Api.get(`/divisions?event_id=${eventId}`);
    const teams = await Api.get(`/teams?event_id=${eventId}`);
    const schedules = await Api.get(`/schedules?event_id=${eventId}`);
    const facilities = await Api.get(`/facilities?event_id=${eventId}`);
    const brackets = await Api.get(`/brackets?event_id=${eventId}`);
    const fields = (
      await Promise.all(
        facilities.map((it: IFacility) =>
          Api.get(`/fields?facilities_id=${it.facilities_id}`)
        )
      )
    ).flat();
    const pools = (
      await Promise.all(
        divisions.map((it: IDivision) =>
          Api.get(`/pools?division_id=${it.division_id}`)
        )
      )
    ).flat();

    const currentEvent = events.find(
      (it: IEventDetails) => it.event_id === eventId
    );

    const activeSchedule = schedules.find(
      (it: ISchedule) => it.is_published_YN === ScheduleStatuses.Published
    );
    const publishedBraket = brackets.find(
      (it: IFetchedBracket) => it.is_published_YN === BracketStatuses.Published
    );

    const schedulesGames = activeSchedule
      ? await Api.get(`/games?schedule_id=${activeSchedule.schedule_id}`)
      : [];

    const fetchedBracketGames = publishedBraket
      ? await Api.get(
          `v_brackets_details?bracket_id=${publishedBraket.bracket_id}`
        )
      : [];

    const bracketGames = mapFetchedBracketGames(fetchedBracketGames, fields);

    dispatch({
      type: LOAD_REPORTING_DATA_SUCCESS,
      payload: {
        event: currentEvent,
        schedule: activeSchedule || null,
        facilities,
        fields,
        divisions,
        teams,
        schedulesGames,
        pools,
        bracketGames,
      },
    });
  } catch {
    dispatch({
      type: LOAD_REPORTING_DATA_FAILURE,
    });

    Toasts.errorToast(
      "Could not load the reporting data. Please, try to reload the page."
    );
  }
};

export { loadReportingData };
