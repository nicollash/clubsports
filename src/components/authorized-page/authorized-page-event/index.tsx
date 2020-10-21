/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  loadAuthPageData,
  loadGameCount,
  clearAuthPageData,
  publishEventData,
  getCountBracketGame,
} from './logic/actions';
import { checkUnassignedGames } from "components/scheduling/logic/actions";
import PopupPublishEvent from './components/popup-publish-event';
import { IAppState } from 'reducers/root-reducer.types';
import Header from 'components/header';
import { Loader, Menu, ScrollTopButton } from 'components/common';
import Facilities from 'components/facilities';
import Scoring from 'components/scoring';
import RecordScores from 'components/scoring/pages/record-scores';
import EventDetails from 'components/event-details';
import Registration from 'components/registration';
import { RouteComponentProps } from 'react-router-dom';
import DivisionsAndPools from 'components/divisions-and-pools';
import AddDivision from 'components/divisions-and-pools/add-division';
import Scheduling from 'components/scheduling';
import Teams from 'components/teams';
import CreateTeam from 'components/teams/components/create-team';
import CreatePlayer from 'components/teams/components/create-player';
import Footer from 'components/footer';
import Schedules from 'components/schedules';
import Reporting from 'components/reporting';
import Playoffs from 'components/playoffs';
import EventLink from 'components/event-link';
import CreateMessage from 'components/event-link/create-message';
import {
  IMenuItem,
  BindingAction,
  ITournamentData,
  ICalendarEvent,
  IPublishSettings,
  BindingCbWithFour,
} from 'common/models';
import {
  Routes,
  EventMenuTitles,
  EventPublishTypes,
  EventModifyTypes,
} from 'common/enums';
import { getIncompleteMenuItems } from '../helpers';
import styles from '../styles.module.scss';
import { closeFullscreen, openFullscreen } from 'helpers';
import {
  filterCalendarEvents,
  checkIfRemind,
} from 'components/calendar/logic/helper';

import {
  getCalendarEvents,
  updateCalendarEvent,
} from 'components/calendar/logic/actions';

interface MatchParams {
  eventId?: string;
}

interface Props {
  isLoading: boolean;
  isLoaded: boolean;
  gameCount: {
    poolLength: number;
    bracketLength: number;
  };
  menuList: IMenuItem[];
  tournamentData: ITournamentData;
  calendarEvents: ICalendarEvent[] | null | undefined;
  countUnassignedGames: number | null;
  loadAuthPageData: (eventId: string) => void;
  loadGameCount: (eventId: string) => void;
  clearAuthPageData: BindingAction;
  getCalendarEvents: BindingAction;
  updateCalendarEvent: BindingAction;
  getCountBracketGame: (bracketId: string) => void;
  checkUnassignedGames: (bracketId: string) => void;
  publishEventData: BindingCbWithFour<
    EventPublishTypes,
    EventModifyTypes,
    IPublishSettings,
    boolean
  >;
}

export const EmptyPage: React.FC = () => {
  return <span> Coming soon...</span>;
};

const AuthorizedPageEvent = ({
  match,
  isLoaded,
  menuList,
  tournamentData,
  gameCount,
  calendarEvents,
  countUnassignedGames,
  loadGameCount,
  loadAuthPageData,
  clearAuthPageData,
  getCalendarEvents,
  updateCalendarEvent,
  publishEventData,
  getCountBracketGame,
  checkUnassignedGames,
}: Props & RouteComponentProps<MatchParams>) => {
  const [isPublishPopupOpen, togglePublishPopup] = React.useState<boolean>(
    false
  );
  const [isFullScreen, toggleFullScreen] = React.useState<boolean>(false);
  const onToggleFullScreen = () => {
    toggleFullScreen(!isFullScreen);

    isFullScreen ? closeFullscreen() : openFullscreen(document.documentElement);
  };
  const eventId = match.params.eventId;
  const { event, schedules, brackets, teams } = tournamentData;

  const onFullScreen = () => {
    if (!document.fullscreen) {
      toggleFullScreen(false);
    }
  };

  React.useEffect(() => {
    if (calendarEvents) {
      const filteredCalendarEvents = filterCalendarEvents(calendarEvents);
      const interval = setInterval(() => {
        checkIfRemind(filteredCalendarEvents, updateCalendarEvent);
      }, 1000 * 60);
      return () => clearInterval(interval);
    }
  });

  React.useEffect(() => {
    if (eventId) {
      loadAuthPageData(eventId);
      loadGameCount(eventId);
      getCalendarEvents();
    }

    return () => clearAuthPageData();
  }, [eventId]);

  React.useEffect(() => {
    isFullScreen
      ? window.addEventListener('fullscreenchange', onFullScreen)
      : window.removeEventListener('fullscreenchange', onFullScreen);

    return () => window.removeEventListener('fullscreenchange', onFullScreen);
  }, [isFullScreen]);

  const onTogglePublishPopup = () => {
    togglePublishPopup(!isPublishPopupOpen);
  };

  const hideOnList = [Routes.SCHEDULES, Routes.RECORD_SCORES, Routes.PLAYOFFS];
  const schedulingIgnoreList = [
    EventMenuTitles.SCHEDULING,
    EventMenuTitles.SCORING,
  ];
  const scoringIgnoreList = [EventMenuTitles.SCORING];
  const reportingIgnoreList = [EventMenuTitles.REPORTING];

  if (eventId && !isLoaded) {
    return <Loader />;
  }

  return (
    <div className={styles.container}>
      {!isFullScreen && <Header />}
      <div className={styles.eventPage}>
        <Menu
          list={menuList}
          event={event || undefined}
          schedules={schedules}
          brackets={brackets}
          hideOnList={hideOnList}
          isAllowEdit={Boolean(eventId)}
          togglePublishPopup={onTogglePublishPopup}
        />
        <main
          className={`${styles.eventPageContent} ${
            isFullScreen ? styles.contentFullScreen : ''
          }`}
        >
          <Switch>
            <Route path={Routes.EVENT_DETAILS_ID} component={EventDetails} />
            <Route path={Routes.FACILITIES_ID} component={Facilities} />
            <Route path={Routes.REGISTRATION_ID} component={Registration} />
            <Route
              path={Routes.DIVISIONS_AND_POOLS_ID}
              component={DivisionsAndPools}
            />
            <Route
              path={Routes.SCHEDULING_ID}
              render={props => (
                <Scheduling
                  {...props}
                  incompleteMenuItems={getIncompleteMenuItems(
                    menuList,
                    schedulingIgnoreList
                  )}
                />
              )}
            />
            <Route
              path={Routes.SCHEDULES_ID}
              render={props => (
                <Schedules
                  {...props}
                  isFullScreen={isFullScreen}
                  onToggleFullScreen={onToggleFullScreen}
                />
              )}
            />
            <Route
              path={Routes.PLAYOFFS_ID}
              render={props => (
                <Playoffs
                  {...props}
                  isFullScreen={isFullScreen}
                  onToggleFullScreen={onToggleFullScreen}
                />
              )}
            />
            <Route path={Routes.TEAMS_ID} component={Teams} />
            <Route
              path={Routes.SCORING_ID}
              render={props => (
                <Scoring
                  {...props}
                  incompleteMenuItems={getIncompleteMenuItems(
                    menuList,
                    scoringIgnoreList
                  )}
                />
              )}
            />
            <Route
              path={Routes.REPORTING_ID}
              render={props => (
                <Reporting
                  {...props}
                  incompleteMenuItems={getIncompleteMenuItems(
                    menuList,
                    reportingIgnoreList
                  )}
                />
              )}
            />
            <Route
              path={Routes.RECORD_SCORES_ID}
              render={props => (
                <RecordScores
                  {...props}
                  isFullScreen={isFullScreen}
                  onToggleFullScreen={onToggleFullScreen}
                />
              )}
            />
            <Route path={Routes.ADD_DIVISION} component={AddDivision} />
            <Route path={Routes.EDIT_DIVISION} component={AddDivision} />
            <Route path={Routes.CREATE_TEAM} component={CreateTeam} />
            <Route path={Routes.CREATE_PLAYER} component={CreatePlayer} />
            <Route path={Routes.CREATE_MESSAGE_ID} component={CreateMessage} />
            <Route path={Routes.EVENT_LINK_ID} component={EventLink} />
            <Route path={Routes.DEFAULT} component={EventDetails} />
          </Switch>
          <ScrollTopButton />
        </main>
      </div>
      {!isFullScreen && <Footer />}
      {event && (
        <>
          <PopupPublishEvent
            event={event}
            gameCount={gameCount}
            teamCount={teams.length || 0}
            schedules={schedules}
            brackets={brackets}
            isOpen={isPublishPopupOpen}
            countUnassignedGames={countUnassignedGames}
            onClose={onTogglePublishPopup}
            publishEventData={publishEventData}
            getCountBracketGame={getCountBracketGame}
            checkUnassignedGames={checkUnassignedGames}
          />
        </>
      )}
    </div>
  );
};

export default connect(
  ({ pageEvent, calendar, scheduling }: IAppState) => ({
    tournamentData: pageEvent.tournamentData,
    isLoading: pageEvent.isLoading,
    isLoaded: pageEvent.isLoaded,
    menuList: pageEvent.menuList,
    calendarEvents: calendar.events,
    gameCount: pageEvent.gameCount,
    countUnassignedGames: scheduling.countUnassignedGames,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      {
        loadAuthPageData,
        loadGameCount,
        clearAuthPageData,
        getCalendarEvents,
        updateCalendarEvent,
        publishEventData,
        getCountBracketGame,
        checkUnassignedGames,
      },
      dispatch
    )
)(AuthorizedPageEvent);
