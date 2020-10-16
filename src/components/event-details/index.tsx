import React, { Component } from "react";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import DeleteIcon from "@material-ui/icons/Delete";
import history from "browserhistory";
import { uploadFile } from "helpers";
import { IEntity } from "common/types";
import { EntryPoints, LibraryStates, EventStatuses } from "common/enums";
import { IUploadFile, IEventDetails, BindingCbWithTwo } from "common/models";
import {
  Button,
  HeadingLevelTwo,
  Loader,
  Tooltip,
  PopupExposure,
  Toasts,
} from "components/common";
import CsvLoader from "components/common/csv-loader";
import DeletePopupConfrim from "components/common/delete-popup-confirm";
import { addEntityToLibrary } from "components/authorized-page/authorized-page-event/logic/actions";
import { IPageEventState } from "components/authorized-page/authorized-page-event/logic/reducer";
import {
  getEventDetails,
  saveEventDetails,
  createEvent,
  removeFiles,
  deleteEvent,
  createEvents,
  createDataFromCSV,
  getOrganizations,
  createFieldManagerDataFromCSV,
} from "./logic/actions";
import { IEventState, IOrganizationState } from "./logic/reducer";
import { IIconFile } from "./logic/model";
import Navigation from "./navigation";
import PrimaryInformationSection from "./primary-information";
import EventStructureSection from "./event-structure";
import MediaAssetsSection from "./media-assets";
import GameDayScoring from "./game-day-scoring";
import PlayoffsSection from "./playoffs";
import CollegeCoaches from "./college-coaches";
import Rankings from "./rankings";
import { eventState } from "./state";
import WellnessStatement from "./wellness-statement";
import EventWarningModal from "./warning-modal";
import styles from "./styles.module.scss";

interface IMapStateProps {
  event: IEventState;
  organizations: IOrganizationState;
  publishStatus: number | undefined;
}

interface Props extends IMapStateProps {
  match: any;
  getEventDetails: (eventId: string) => void;
  getOrganizations: () => void;
  saveEventDetails: (event: Partial<IEventDetails>) => void;
  createEvent: (event: Partial<IEventDetails>) => void;
  uploadFiles: (files: IIconFile[]) => void;
  removeFiles: (files: IIconFile[]) => void;
  deleteEvent: BindingCbWithTwo<string, string>;
  createEvents: (events: Partial<IEventDetails>[]) => void;
  createDataFromCSV: (data: any) => void;
  addEntityToLibrary: BindingCbWithTwo<IEntity, EntryPoints>;
}

type State = {
  eventId: string | undefined;
  event?: Partial<IEventDetails>;
  error: boolean;
  isModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isCsvLoaderOpen: boolean;
  isDataLoaderOpen: boolean;
  isFieldManagerCsvLoaderOpen: boolean;
  isSectionsExpand: boolean;
  changesAreMade: boolean;
  warningModalOpen: boolean;
  warningMessage: string;
};

class EventDetails extends Component<Props, State> {
  state: State = {
    eventId: undefined,
    event: undefined,
    error: false,
    isModalOpen: false,
    isDeleteModalOpen: false,
    isCsvLoaderOpen: false,
    isDataLoaderOpen: false,
    isFieldManagerCsvLoaderOpen: false,
    isSectionsExpand: false,
    changesAreMade: false,
    warningModalOpen: false,
    warningMessage: '',
  };

  componentDidMount() {
    this.checkEventExistence();
    this.props.getOrganizations();
  }

  componentDidUpdate(prevProps: Props) {
    const { data, isEventLoading } = this.props.event;

    if (!isEventLoading && isEventLoading !== prevProps.event.isEventLoading) {
      this.setState({
        eventId: data?.event_id,
        event: data,
      });
    }
  }

  checkEventExistence = () => {
    const {
      match: {
        params: { eventId },
      },
      getEventDetails,
    } = this.props;

    if (eventId) {
      this.setState({ eventId });
      getEventDetails(eventId);
      return;
    }
    this.setState({
      event: eventState(),
    });
  };

  onChange = (name: string, value: any, ignore?: boolean) => {
    const { changesAreMade } = this.state;

    this.setState(({ event }) => ({
      event: {
        ...event,
        [name]: value,
      },
    }));
    if (!changesAreMade && !ignore) {
      this.setState({ changesAreMade: true });
    }
  };

  onFileUpload = async (files: IUploadFile[]) => {
    for await (let file of files) {
      const uploadedFile = await uploadFile(file);
      const { key } = uploadedFile as Storage;

      this.onChange(file.destinationType, key);
    }
  };

  onFileRemove = (files: IUploadFile[]) => this.props.removeFiles(files);

  onSavePressed = async () => {
    const { publishStatus } = this.props;
    const { event } = this.state;

    if (publishStatus && EventStatuses[publishStatus] === "Published") {
      this.setState({
        warningMessage: `Warning: This event is currently published.
        You would need to "unpublish" the event if you would like to edit it.`,
      });
      this.openWarningModal();
      return;
    }

    if (
      event?.event_type === "League" &&
      (!event?.league_dates || event?.league_dates === "[]")
    ) {
      this.setState({
        warningMessage: `Warning: You select event type "League", but you did not select any dates.
        Please specify dates of the events for the league.`,
      });
      this.openWarningModal();
      return;
    }

    this.onSave();
  };

  onSave = () => {
    const { createEvent, saveEventDetails, publishStatus } = this.props;
    const { event, eventId } = this.state;
    this.onModalClose();
    this.setState({ changesAreMade: false });

    if (!event) return;

    if (!event.org_id || event.org_id === "") {
      return Toasts.errorToast(`Field "Profit Center"  is required`);
    }

    const leagueDates =
      event.event_type === "Tournament" || event.event_type === "Showcase"
        ? event.discontinuous_dates_YN
          ? event.league_dates
          : null
        : event.league_dates;

    if (eventId) {
      saveEventDetails({
        ...event,
        is_published_YN: publishStatus,
        league_dates: leagueDates,
      });
      return;
    }
    createEvent(event);
  };

  toggleSectionCollapse = () =>
    this.setState({ isSectionsExpand: !this.state.isSectionsExpand });

  onDeleteClick = () => this.setState({ isDeleteModalOpen: true });

  onDeleteModalClose = () => this.setState({ isDeleteModalOpen: false });

  onCancelClick = () => {
    const { changesAreMade } = this.state;

    if (changesAreMade) {
      this.setState({ isModalOpen: true });
    } else {
      this.onCancel();
    }
  };

  onModalClose = () => this.setState({ isModalOpen: false });

  onCancel = () => history.push("/");

  openWarningModal = () => this.setState({ warningModalOpen: true });

  closeWarningModal = () => this.setState({ warningModalOpen: false });

  onCsvLoaderBtn = () => this.setState({ isCsvLoaderOpen: true });

  onCsvLoaderClose = () => this.setState({ isCsvLoaderOpen: false });

  onOpenFieldManagerCsvLoader = () => this.setState({ isFieldManagerCsvLoaderOpen: true });

  onCloseFieldManagerCsvLoader = () => this.setState({ isFieldManagerCsvLoaderOpen: false });

  onDataLoaderBtn = () => this.setState({ isDataLoaderOpen: true });

  onDataLoaderClose = () => this.setState({ isDataLoaderOpen: false });

  onAddToLibraryManager = () => {
    const { addEntityToLibrary } = this.props;
    const { event } = this.state;

    if (event?.is_library_YN === LibraryStates.FALSE) {
      this.onChange("is_library_YN", LibraryStates.TRUE);
    }
    addEntityToLibrary(event as IEventDetails, EntryPoints.EVENTS);
  };

  renderDeleteEventBtn = () => {
    const { publishStatus } = this.props;
    const isPublish =
      publishStatus && EventStatuses[publishStatus] === "Published";

    return (
      <Button
        label="Delete Event"
        variant="text"
        color="secondary"
        type="dangerLink"
        disabled={Boolean(isPublish)}
        icon={<DeleteIcon style={{ fill: "#FF0F19" }} />}
        onClick={this.onDeleteClick}
      />
    );
  };

  render() {
    const {
      event: { isEventLoading },
      match,
      createEvents,
      createDataFromCSV,
      deleteEvent,
    } = this.props;
    const {
      event,
      isCsvLoaderOpen,
      isDataLoaderOpen,
      isFieldManagerCsvLoaderOpen,
      isDeleteModalOpen,
      isModalOpen,
      isSectionsExpand,
      warningModalOpen,
      warningMessage,
    } = this.state;
    const deleteMessage = `You are about to delete this event and this cannot be undone. All related data to this event will be deleted too.
      Please, enter the name of the event to continue.`;

    if (!event || isEventLoading) {
      return <Loader />;
    }

    const {
      desktop_icon_URL,
      event_name,
      event_id,
      is_published_YN,
      mobile_icon_URL,
    } = event;
    const commonChildProps = {
      eventData: event,
      onChange: this.onChange,
      isSectionExpand: isSectionsExpand,
    };

    return (
      <div className={styles.container}>
        <Navigation
          isEventId={match?.params.eventId}
          onCancelClick={this.onCancelClick}
          onCsvLoaderBtn={this.onCsvLoaderBtn}
          onDataLoaderBtn={this.onDataLoaderBtn}
          onAddToLibraryManager={this.onAddToLibraryManager}
          onSave={this.onSavePressed}
        />
        <div className={styles.headingContainer}>
          <HeadingLevelTwo margin="24px 0">Event Details</HeadingLevelTwo>
          <div>
            {match?.params.eventId && is_published_YN ? (
              <Tooltip
                type="info"
                title="This event is currently published. Unpublish it first if you would like to delete it."
              >
                <span>{this.renderDeleteEventBtn()}</span>
              </Tooltip>
            ) : (
              this.renderDeleteEventBtn()
            )}
            <Button
              label={isSectionsExpand ? "Collapse All" : "Expand All"}
              variant="text"
              color="secondary"
              onClick={this.toggleSectionCollapse}
            />
          </div>
        </div>
        <PrimaryInformationSection
          {...commonChildProps}
          organizations={this.props.organizations.dataOrg}
        />
        <EventStructureSection {...commonChildProps} />
        <WellnessStatement {...commonChildProps} />
        <Rankings {...commonChildProps} />
        <PlayoffsSection {...commonChildProps} />
        <CollegeCoaches
          eventData={commonChildProps.eventData}
          isSectionExpand={isSectionsExpand}
          onChange={this.onChange}
        />
        <MediaAssetsSection
          onFileUpload={this.onFileUpload}
          onFileRemove={this.onFileRemove}
          isSectionExpand={isSectionsExpand}
          logo={desktop_icon_URL}
          mobileLogo={mobile_icon_URL}
        />
        <GameDayScoring
          eventData={commonChildProps.eventData}
          onChange={this.onChange}
          isSectionExpand={isSectionsExpand}
          onCsvLoaderBtn={this.onOpenFieldManagerCsvLoader}
        />
        <DeletePopupConfrim
          type={"event"}
          deleteTitle={event_name!}
          message={deleteMessage}
          isOpen={isDeleteModalOpen}
          onClose={this.onDeleteModalClose}
          onDeleteClick={() => {
            deleteEvent(event_id!, event_name!);
          }}
        />
        <PopupExposure
          isOpen={isModalOpen}
          onClose={this.onModalClose}
          onExitClick={this.onCancel}
          onSaveClick={this.onSavePressed}
        />
        <EventWarningModal
          isOpen={warningModalOpen}
          message={warningMessage}
          onClose={this.closeWarningModal}
        />
        <CsvLoader
          type="event_master"
          isOpen={isCsvLoaderOpen}
          onClose={this.onCsvLoaderClose}
          onCreate={createEvents}
        />
        <CsvLoader
          type="divisions_pools_teams"
          isOpen={isDataLoaderOpen}
          onClose={this.onDataLoaderClose}
          onCreate={createDataFromCSV}
          eventId={event_id!}
        />
        <CsvLoader
          type="sms_authorized_scorers"
          isOpen={isFieldManagerCsvLoaderOpen}
          onClose={this.onCloseFieldManagerCsvLoader}
          onCreate={createFieldManagerDataFromCSV}
        />
      </div>
    );
  }
}

interface IRootState {
  event: IEventState;
  organizations: IOrganizationState;
  pageEvent: IPageEventState;
}

const mapStateToProps = (state: IRootState): IMapStateProps => ({
  event: state.event,
  organizations: state.organizations,
  publishStatus: state?.pageEvent?.tournamentData?.event?.is_published_YN,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      getEventDetails,
      getOrganizations,
      saveEventDetails,
      createEvent,
      removeFiles,
      deleteEvent,
      createEvents,
      createDataFromCSV,
      addEntityToLibrary,
      createFieldManagerDataFromCSV,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EventDetails);
