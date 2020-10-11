import React from "react";
import { connect } from "react-redux";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { History } from "history";
import { Loader, Modal } from "components/common";
import {
  BindingAction,
  ICalendarEvent,
  IOrganization,
} from "common/models";
import { EventStatuses} from "common/enums";
import Button from "../common/buttons/button";
import HeadingLevelTwo from "../common/headings/heading-level-two";
import Paper from "../common/paper";
import OnboardingWizard from "components/onboarding-wizard";
import { loadOrganizations } from "components/organizations-management/logic/actions";
import TimelineCard from "./timeline-card";
import NotificationsCard from "./notifications-card";
import InfoCard from "./info-card";
import TournamentCard from "./tournament-card";
import { getEvents, dashboardClear, getCalendarEvents } from "./logic/actions";
import styles from "./style.module.scss";
import { IDashboardsCard } from './logic/reducer';

interface IDashboardProps {
  history: History;
  isLoading: boolean;
  organizations: IOrganization[];
  calendarEvents: ICalendarEvent[];
  dashboardCards: IDashboardsCard[];
  isDetailLoading: boolean;
  areCalendarEventsLoading: boolean;
  getEvents: () => void;
  dashboardClear: () => void;
  getCalendarEvents: BindingAction;
  loadOrganizations: BindingAction;
}

interface IDashboardState {
  order: number;
  filters: { status: number[]; historical: boolean };
  isOnboardingWizardOpen: boolean;
  isSkipOpen: boolean;
}

class Dashboard extends React.Component<IDashboardProps, IDashboardState> {
  state = {
    order: 1,
    filters: { status: [1, 0], historical: false },
    isOnboardingWizardOpen: false,
    isSkipOpen: false,
  };

  componentDidMount() {
    const { loadOrganizations, getEvents, getCalendarEvents } = this.props;

    loadOrganizations();
    getEvents();
    getCalendarEvents();
  };

  componentDidUpdate(prevProps: IDashboardProps) {
    const { organizations } = this.props;

    if (
      !prevProps.organizations.length &&
      prevProps.organizations !== organizations
    ) {
      this.setState({
        isOnboardingWizardOpen: !organizations.length,
      });
    }
  };

  componentWillUnmount() {
    this.props.dashboardClear();
  };

  onSkipOpen = () => this.setState({ isSkipOpen: true });

  onSkipClose = () => this.setState({ isSkipOpen: false });

  onSkip = () => {
    this.setState({ isOnboardingWizardOpen: true });

    this.onSkipClose();
  };

  onCreateTournament = () => this.props.history.push("/event/event-details");

  onOrderChange = (order: number) => this.setState({ order });

  filterEvents = (status: number) => {
    const { filters } = this.state;

    if (filters.status.includes(status)) {
      this.setState({
        filters: {
          historical: false,
          status: filters.status.filter((filter: number) => filter !== status),
        },
      });
    } else {
      this.setState({
        filters: {
          historical: false,
          status: [...filters.status, status],
        },
      });
    }
  };

  onPublishedFilter = () => this.filterEvents(EventStatuses.Published);

  onDraftFilter = () => this.filterEvents(EventStatuses.Draft);

  onHistoricalFilter = () => {
    const { filters } = this.state;

    this.setState({
      filters: {
        status: [],
        historical: !filters.historical,
      },
    });
  };

  renderEvents = () => {
    const {
      history,
      isDetailLoading,
      isLoading,
      dashboardCards
    } = this.props;
    const { filters } = this.state;

    const filteredEvents = filters.historical
      ? dashboardCards.filter((card) => new Date(card.event.event_enddate) < new Date())
      : dashboardCards.filter((card) =>
          filters.status.includes(card.event.is_published_YN)
        );

    filteredEvents.sort((a, b) =>
      new Date(a.event.event_enddate).getTime() < new Date(b.event.event_enddate).getTime()
        ? 1
        : -1
    );
    
    const numOfPublished = dashboardCards?.filter(
      (card) => card.event.is_published_YN === EventStatuses.Published
    ).length;
    const numOfDraft = dashboardCards?.filter(
      (card) => card.event.is_published_YN === EventStatuses.Draft
    ).length;
    const numOfHistorical = dashboardCards?.filter(
      (card) => new Date(card.event.event_enddate) < new Date()
    ).length;

    return (
      <div className={styles.tournamentsContainer} key={1}>
        <div className={styles.tournamentsHeading}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FontAwesomeIcon
                size="xs"
                icon={faTrophy}
                style={{ marginRight: "5px" }}
              />
              Events
            </div>
          </div>
          <div className={styles.buttonsGroup}>
            <Button
              label={`Published (${numOfPublished})`}
              variant="contained"
              color="primary"
              type={
                filters.status.includes(EventStatuses.Published) &&
                !filters.historical
                  ? "squared"
                  : "squaredOutlined"
              }
              onClick={this.onPublishedFilter}
            />
            <Button
              label={`Draft (${numOfDraft})`}
              variant="contained"
              color="primary"
              type={
                filters.status.includes(EventStatuses.Draft) &&
                !filters.historical
                  ? "squared"
                  : "squaredOutlined"
              }
              onClick={this.onDraftFilter}
            />
            <Button
              label={`Historical (${numOfHistorical})`}
              variant="contained"
              color="primary"
              type={filters.historical ? "squared" : "squaredOutlined"}
              onClick={this.onHistoricalFilter}
            />
          </div>
        </div>
        <div className={styles.tournamentsListContainer}>
          {isLoading && (
            <div className={styles.loaderContainer}>
              <Loader />
            </div>
          )}
          {filteredEvents && !isLoading
            ? filteredEvents.map((card: IDashboardsCard) => (
                <TournamentCard
                  key={card.event.event_id}
                  event={card.event}
                  history={history}
                  numOfTeams={card.numTeams!}
                  numOfFields={card.numFieds!}
                  numOfGameCount={card.numGames!}
                  numOfPlayerCount={card.numPlayers!}
                  numOfLocations={card.numLocations!}
                  registrationStatus={card.regStatus!}
                  lastScheduleRelease={card.lastScheduleRealese}
                  isDetailLoading={isDetailLoading}
                />
              ))
            : !isLoading && (
                <div className={styles.noFoundWrapper}>
                  <span>
                    You have not any events just yet. Start with the above "+
                    Create Event" button.
                  </span>
                </div>
              )}
        </div>
      </div>
    );
  };

  renderNotifications = () => (
    <div className={styles.notificationsContainer} key={2}>
      <NotificationsCard
        data={this.props.calendarEvents.filter(
          (event) =>
            event.cal_event_type === "reminder" &&
            event.status_id === 1 &&
            new Date(event.cal_event_datetime) > new Date()
        )}
        areCalendarEventsLoading={this.props.areCalendarEventsLoading}
      />
    </div>
  );

  renderTimeline = () => (
    <div className={styles.timelineContainer} key={3}>
      <TimelineCard
        data={this.props.calendarEvents.filter((event) => event.cal_event_id)}
        areCalendarEventsLoading={this.props.areCalendarEventsLoading}
      />
    </div>
  );

  renderDashbaordInOrder = () => {
    const { order } = this.state;

    switch (order) {
      case 1:
        return [
          this.renderEvents(),
          this.renderNotifications(),
          this.renderTimeline(),
        ];
      case 2:
        return [
          this.renderNotifications(),
          this.renderEvents(),
          this.renderTimeline(),
        ];
      case 3:
        return [
          this.renderTimeline(),
          this.renderNotifications(),
          this.renderEvents(),
        ];
      default:
        return [
          this.renderEvents(),
          this.renderNotifications(),
          this.renderTimeline(),
        ];
    }
  };

  render() {
    const { isOnboardingWizardOpen, isSkipOpen } = this.state;
    const { calendarEvents, dashboardCards} = this.props;

    return (
      <div className={styles.main}>
        <Paper sticky={true}>
          <div className={styles.mainMenu}>
            <Button
              label="+ Create Event"
              variant="contained"
              color="primary"
              onClick={this.onCreateTournament}
            />
          </div>
        </Paper>
        <div className={styles.heading}>
          <HeadingLevelTwo>My Dashboard</HeadingLevelTwo>
        </div>
        <div className={styles.dashboardCardsContainer}>
          <InfoCard
            icon={<FontAwesomeIcon size="lg" icon={faTrophy} />}
            info={`${dashboardCards?.length} Events`}
            order={1}
            changeOrder={this.onOrderChange}
          />
          <InfoCard
            icon={<NotificationsIcon fontSize="large" />}
            info={`${
              calendarEvents.filter(
                (event) =>
                  event.cal_event_type === "reminder" &&
                  event.status_id === 1 &&
                  new Date(event.cal_event_datetime) > new Date()
              ).length
            } Pending Reminders`}
            order={2}
            changeOrder={this.onOrderChange}
          />
          <InfoCard
            icon={<FormatListBulletedIcon fontSize="large" />}
            info={`${
              calendarEvents.filter(
                (event) =>
                  event.cal_event_type === "task" && event.status_id === 1
              ).length
            } Pending/Open Tasks`}
            order={3}
            changeOrder={this.onOrderChange}
          />
        </div>
        {this.renderDashbaordInOrder()}
        <OnboardingWizard
          isOpen={isOnboardingWizardOpen}
          onSkipOpen={this.onSkipOpen}
        />
        <Modal isOpen={isSkipOpen} onClose={() => {}}>
          <div className={styles.modal}>
            <p className={styles.message}>
              You can create or join an organization later under the
              Collaboration Menu
            </p>
            <div className={styles.btnWrapper}>
              <Button
                label="Continue"
                color="secondary"
                variant="text"
                onClick={this.onSkip}
              />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
};
interface IState {
  events: {
    isLoading: boolean;
    dashboardCards: IDashboardsCard[];
    calendarEvents: ICalendarEvent[];
    isDetailLoading: boolean;
    areCalendarEventsLoading: boolean;
  };
  organizationsManagement: { organizations: IOrganization[] };
};

const mapStateToProps = (state: IState) => ({
  calendarEvents: state.events.calendarEvents,
  isLoading: state.events.isLoading,
  isDetailLoading: state.events.isDetailLoading,
  areCalendarEventsLoading: state.events.areCalendarEventsLoading,
  organizations: state.organizationsManagement.organizations,
  dashboardCards: state.events.dashboardCards,
});

const mapDispatchToProps = {
  getEvents,
  dashboardClear,
  getCalendarEvents,
  loadOrganizations,
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
