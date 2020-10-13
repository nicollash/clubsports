import React from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { loadReportingData } from './logic/actions';
import Navigation from './components/navigation';
import ItemSchedules from './components/item-schedules';
import {
  stringToLink,
  getTimeValuesFromEventSchedule,
  calculateTimeSlots,
  calculateTournamentDays,
} from 'helpers';
import { HeadingLevelTwo, Loader, HazardList } from 'components/common';
import {
  IDivision,
  ITeam,
  IFacility,
  IEventDetails,
  IField,
  ISchedule,
  IMenuItem,
  IPool,
  BindingAction,
  ISchedulesGame,
} from 'common/models';
import { EventMenuTitles, TimeSlotsEntityTypes } from 'common/enums';
import { IAppState } from 'reducers/root-reducer.types';
import styles from './styles.module.scss';
import {
  mapFieldsData,
  mapTeamsData,
  mapFacilitiesData,
  mapDivisionsData,
} from 'components/schedules/mapTournamentData';
import {
  defineGames,
  sortFieldsByPremier,
  IGame,
} from 'components/common/matrix-table/helper';
import {
  ITeam as IScheduleTeam,
  ITeamCard,
} from 'common/models/schedule/teams';
import { mapTeamsFromShedulesGames } from 'components/schedules/mapScheduleData';
import {
  fillSchedulesTable,
  clearSchedulesTable,
} from 'components/schedules/logic/schedules-table/actions';
import { fetchScheduleTeamDetails } from 'components/schedules/logic/actions';
import ITimeSlot from 'common/models/schedule/timeSlots';
import { IScheduleFacility } from 'common/models/schedule/facilities';
import { IScheduleDivision } from 'common/models/schedule/divisions';
import { IField as IScheduleField } from 'common/models/schedule/fields';
import { IScheduleTeamDetails } from 'common/models/schedule/schedule-team-details';
// import { mapGamesWithSchedulesGames } from 'components/scoring/helpers';
import { adjustPlayoffTimeOnLoadScoring } from 'components/schedules/definePlayoffs';
import { IBracketGame } from 'components/playoffs/bracketGames';

interface MatchParams {
  eventId: string;
}
interface Props {
  isLoading: boolean;
  isLoaded: boolean;
  incompleteMenuItems: IMenuItem[];
  event: IEventDetails | null;
  facilities: IFacility[];
  divisions: IDivision[];
  fields: IField[];
  teams: ITeam[];
  schedulesGames: ISchedulesGame[];
  pools: IPool[];
  schedule: ISchedule | null;
  scheduleTeamDetails?: IScheduleTeamDetails[];
  schedulesTeamCards?: ITeamCard[];
  bracketGames: IBracketGame[];
  loadReportingData: (eventId: string) => void;
  fillSchedulesTable: (teamCards: ITeamCard[]) => void;
  fetchScheduleTeamDetails: (scheduleId: string, eventId: string) => void;
  clearSchedulesTable: BindingAction;
}

interface State {
  games?: IGame[];
  timeSlots?: ITimeSlot[];
  teams?: IScheduleTeam[];
  fields?: IScheduleField[];
  facilities?: IScheduleFacility[];
  divisions?: IScheduleDivision[];
  playoffTimeSlots?: ITimeSlot[];
  neccessaryDataCalculated: boolean;
  isEmptyListsIncluded?: boolean;
}

class Reporting extends React.Component<
  Props & RouteComponentProps<MatchParams>,
  State
> {
  constructor(props: Props & RouteComponentProps<MatchParams>) {
    super(props);

    this.state = {
      neccessaryDataCalculated: false,
      isEmptyListsIncluded: false,
    };
  }

  componentDidMount() {
    const eventId = this.props.match.params.eventId;
    const schedule = this.props.schedule;
    this.props.clearSchedulesTable();
    this.props.loadReportingData(eventId);
    if(schedule) {
      this.props.fetchScheduleTeamDetails(schedule.schedule_id, eventId);
    }
  }

  componentDidUpdate() {
    const { schedule, schedulesGames, schedulesTeamCards, event, fetchScheduleTeamDetails } = this.props;
    const { teams, games, timeSlots, neccessaryDataCalculated } = this.state;

    if (!neccessaryDataCalculated && schedule) {
      this.calculateNeccessaryData();
      return;
    }

    if (
      event &&
      !schedulesTeamCards &&
      schedulesGames.length &&
      games?.length &&
      teams &&
      schedule
    ) {
      fetchScheduleTeamDetails(schedule.schedule_id, event.event_id);
      const days = calculateTournamentDays(event);
      const lastDay = days[days.length - 1];

      // const mappedGames = mapGamesWithSchedulesGames(games, schedulesGames);

      const playoffTimeSlots = adjustPlayoffTimeOnLoadScoring(
        schedulesGames,
        timeSlots!,
        event,
        lastDay
      );

      this.setState({ games: games, playoffTimeSlots });

      const mappedTeams = mapTeamsFromShedulesGames(
        schedulesGames,
        teams,
        games
      );

      this.props.fillSchedulesTable(mappedTeams);
    }
  }

  calculateNeccessaryData = () => {
    const {
      event,
      schedule,
      fields,
      teams,
      divisions,
      facilities,
      schedulesGames,
    } = this.props;

    if (
      !schedule ||
      !event ||
      !Boolean(fields.length) ||
      !Boolean(teams.length) ||
      !Boolean(divisions.length) ||
      !Boolean(facilities.length)
    ) {
      return;
    }

    const timeValues = getTimeValuesFromEventSchedule(event, schedule);

    const timeSlots = calculateTimeSlots(
      timeValues,
      schedulesGames,
      TimeSlotsEntityTypes.SCHEDULE_GAMES
    );

    const mappedFields = mapFieldsData(fields, facilities);
    const sortedFields = sortFieldsByPremier(mappedFields);

    const { games } = defineGames(sortedFields, timeSlots!);

    const mappedTeams = mapTeamsData(teams, divisions);
    const mappedFacilities = mapFacilitiesData(facilities);

    const mappedDivisions = mapDivisionsData(divisions);

    return this.setState({
      games,
      timeSlots,
      divisions: mappedDivisions,
      fields: sortedFields,
      teams: mappedTeams,
      facilities: mappedFacilities,
      neccessaryDataCalculated: true,
    });
  };

  onCheckboxClick = (isEmpty: boolean) => {
    this.setState({ isEmptyListsIncluded: isEmpty });
  };

  render() {
    const { incompleteMenuItems } = this.props;
    const isAllowViewPage = incompleteMenuItems.length === 0;

    if (!isAllowViewPage) {
      return (
        <HazardList
          incompleteMenuItems={incompleteMenuItems}
          eventId={this.props.match.params.eventId}
        />
      );
    }

    const {
      isLoading,
      divisions,
      event,
      schedule,
      scheduleTeamDetails,    
      schedulesTeamCards,
      pools,
      bracketGames,
      schedulesGames,
    } = this.props;

    const {
      fields,
      timeSlots,
      games,
      facilities,
      playoffTimeSlots,
      isEmptyListsIncluded,
    } = this.state;

    const loadCondition = !!(
      event &&
      fields?.length &&
      games?.length &&
      timeSlots?.length &&
      facilities?.length &&
      Boolean(divisions.length) &&
      schedulesTeamCards?.length
    );

    return (
      <section id={stringToLink(EventMenuTitles.REPORTING)}>
        <Navigation
          isEmptyListsIncluded={isEmptyListsIncluded || false}
          onCheckboxClick={this.onCheckboxClick}
        />
        <div className={styles.titleWrapper}>
          <HeadingLevelTwo>{EventMenuTitles.REPORTING}</HeadingLevelTwo>
        </div>
        {loadCondition && !isLoading ? (
          <ul className={styles.reportingList}>
            <ItemSchedules
              event={event!}
              fields={fields!}
              facilities={facilities!}
              schedule={schedule!}
              scheduleTeamDetails={scheduleTeamDetails!}
              timeSlots={timeSlots!}
              games={games!}
              teamCards={schedulesTeamCards!}
              pools={pools}
              bracketGames={bracketGames}
              playoffTimeSlots={playoffTimeSlots}
              divisions={divisions}
              schedulesGames={schedulesGames}
              isEmptyListsIncluded={isEmptyListsIncluded}
            />
          </ul>
        ) : (
          <Loader />
        )}
      </section>
    );
  }
}

export default connect(
  ({ reporting, schedulesTable, schedules }: IAppState) => ({
    isLoading: reporting.isLoading,
    isLoaded: reporting.isLoaded,
    event: reporting.event,
    facilities: reporting.facilities,
    fields: reporting.fields,
    divisions: reporting.divisions,
    teams: reporting.teams,
    schedule: reporting.schedule,
    scheduleTeamDetails: schedules?.scheduleTeamDetails,
    schedulesTeamCards: schedulesTable?.current,
    schedulesGames: reporting.schedulesGames,
    pools: reporting.pools,
    bracketGames: reporting.bracketGames,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      { 
        loadReportingData, 
        fillSchedulesTable, 
        clearSchedulesTable,
        fetchScheduleTeamDetails,
        },
      dispatch
    )
)(Reporting);
