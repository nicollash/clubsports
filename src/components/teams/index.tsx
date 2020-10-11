import React from "react";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import {
  loadPools,
  saveTeams,
  deleteTeam,
  savePlayer,
  deletePlayer,
  loadTeamsData,
  canceledDelete,
  createTeamsCsv,
  createPlayersCsv,
  checkTeamInSchedule,
} from "./logic/actions";
import Navigation from "./components/navigation";
import TeamManagement from "./components/team-management";
import PlayerManagement from "./components/player-management";
import {
  Modal,
  Loader,
  PopupExposure,
  PopupTeamEdit,
  PopupPlayerEdit,
  HeadingLevelTwo,
  PopupPlayerTeamChange,
} from "components/common";
import { IAppState } from "reducers/root-reducer.types";
import {
  IPool,
  ITeam,
  IPlayer,
  IDivision,
  BindingCbWithTwo,
  ISchedulesGameWithNames,
} from "../../common/models";
import styles from "./styles.module.scss";
import CsvLoader from "components/common/csv-loader";
import history from "browserhistory";
import { ComponentType } from "components/common/popup-team-edit";

interface MatchParams {
  eventId?: string;
}

interface Props {
  games: ISchedulesGameWithNames[];
  pools: IPool[];
  teams: ITeam[];
  players: IPlayer[];
  isLoaded: boolean;
  isLoading: boolean;
  divisions: IDivision[];
  bracketsNames: string[];
  isOpenConfirm: boolean;
  schedulesNames: string[];
  isOpenDeleteConfirm: boolean;
  isLoadingSchedulesAndBracketsNames: boolean;
  loadPools: (divisionId: string) => void;
  saveTeams: (teams: ITeam[], cb?: (param?: object) => void) => void;
  deleteTeam: () => void;
  savePlayer: (player: IPlayer[]) => void;
  deletePlayer: (player: IPlayer[]) => void;
  loadTeamsData: (eventId: string) => void;
  canceledDelete: () => void;
  createTeamsCsv: (teams: ITeam[], cb: (param?: object) => void) => void;
  checkTeamInSchedule: (teamId: string, eventId: string) => void;
  createPlayersCsv: BindingCbWithTwo<
    Partial<IPlayer>[],
    (param?: object) => void
  >;
}

interface State {
  teams: ITeam[];
  currentPool: string | null;
  currentDivision: IDivision | null;
  configurableTeam: ITeam | null;
  configurablePlayers: IPlayer[];
  changesAreMade: boolean;
  isCsvLoaderOpen: boolean;
  isEditPopupOpen: boolean;
  isConfirmModalOpen: boolean;
  isPlayerCsvLoaderOpen: boolean;
  isEditPlayerPopupOpen: boolean;
  isChangeTeamPlayerPopupOpen: boolean;
}

class Teams extends React.Component<
  Props & RouteComponentProps<MatchParams>,
  State
> {
  constructor(props: Props & RouteComponentProps<MatchParams>) {
    super(props);

    this.state = {
      teams: [],
      configurableTeam: null,
      configurablePlayers: [],
      currentDivision: null,
      currentPool: null,
      isEditPopupOpen: false,
      isEditPlayerPopupOpen: false,
      isChangeTeamPlayerPopupOpen: false,
      isConfirmModalOpen: false,
      isCsvLoaderOpen: false,
      isPlayerCsvLoaderOpen: false,
      changesAreMade: false,
    };
  }

  componentDidMount() {
    const { loadTeamsData } = this.props;
    const eventId = this.props.match.params.eventId;

    if (eventId) {
      loadTeamsData(eventId);
    }
  }

  componentDidUpdate(PrevProps: Props) {
    const { isLoading, teams } = this.props;

    if (
      PrevProps.isLoading !== isLoading ||
      PrevProps.teams.length !== this.props.teams.length
    ) {
      this.setState({ teams: teams });
    }
  }

  onSaveClick = () => {
    const eventId = this.props.match.params.eventId;
    const { saveTeams } = this.props;
    const { teams } = this.state;

    if (eventId) {
      saveTeams(teams);
    }
    this.setState({ isConfirmModalOpen: false });
  };

  onCancelClick = () => {
    const { teams } = this.props;

    this.setState({ teams, isConfirmModalOpen: false });
    history.push(`/event/event-details/${this.props.match.params.eventId}`);
  };

  onDeleteTeam = (team: ITeam) => {
    this.props.deleteTeam();

    this.setState(
      ({ teams }) => ({
        teams: teams.map((it) =>
          it.team_id === team.team_id ? { ...it, isDelete: true } : it
        ),
      }),
      this.onSaveClick
    );

    this.onCloseModal();
  };

  onDeleteTeamFromSchedule = () => {
    this.props.deleteTeam();
    this.onCloseModal();
  };

  onCheckTeam = (team: ITeam) => {
    const { match, checkTeamInSchedule } = this.props;
    const eventId = match.params.eventId;

    checkTeamInSchedule(team.team_id, eventId!);
  };

  onDeleteAllTeams = (divisionId: string) => {
    this.setState(
      ({ teams }) => ({
        teams: teams.map((it) =>
          it.division_id === divisionId ? { ...it, isDelete: true } : it
        ),
      }),
      this.onSaveClick
    );
  };

  onDeleteAllPlayers = () => {
    // this.setState(({ teams }) => ({
    //   teams: teams.map(it =>
    //     it.division_id === divisionId ? { ...it, isDelete: true } : it
    //   ),
    // }), this.onSaveClick);
  };

  onEditPopupOpen = (team: ITeam, division: IDivision, poolName: string) =>
    this.setState({
      isEditPopupOpen: true,
      configurableTeam: team,
      currentDivision: division,
      currentPool: poolName,
    });

  onEditPlayerPopupOpen = (players: IPlayer[]) => {
    this.setState({
      configurablePlayers: players,
    });
  };

  onDeletePlayer = (players: IPlayer[]) => {
    this.props.deletePlayer(players);
  };

  onChangeTeamPopupOpen = (players: IPlayer[]) => {
    this.setState({
      isChangeTeamPlayerPopupOpen: true,
      configurablePlayers: players,
    });
  };

  onChangeTeam = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(({ configurableTeam }) => ({
      configurableTeam: {
        ...(configurableTeam as ITeam),
        [name]: value,
        isChange: true,
      },
    }));
    if (!this.state.changesAreMade) {
      this.setState({ changesAreMade: true });
    }
  };

  onChangePlayer = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const { configurablePlayers } = this.state;
    if (configurablePlayers.length > 0) {
      const newConfigurablePlayers = configurablePlayers.map((player) => ({
        ...player,
        [name]: value,
        isChange: true,
      }));
      this.setState({
        configurablePlayers: newConfigurablePlayers,
      });
    }
  };

  onChangePlayerPhoneNumber = (phoneNumber: string) => {
    const { configurablePlayers } = this.state;
    if (configurablePlayers.length === 1) {
      const firstConfigurablePlayer = configurablePlayers[0];
      const newPlayers = [
        {
          ...firstConfigurablePlayer,
          phone_num: phoneNumber,
          isChange: true,
        },
      ];
      this.setState({
        configurablePlayers: newPlayers,
      });
    }
  };

  onChangePhoneNumber = (value: string) => {
    this.setState(({ configurableTeam }) => ({
      configurableTeam: {
        ...(configurableTeam as ITeam),
        phone_num: value,
        isChange: true,
      },
    }));
    if (!this.state.changesAreMade) {
      this.setState({ changesAreMade: true });
    }
  };

  onChangeDivision = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDivision =
      this.props.divisions.find(
        (division: IDivision) => division.division_id === value
      ) || null;
    this.setState(({ configurableTeam }) => ({
      configurableTeam: {
        ...(configurableTeam as ITeam),
        division_id: value,
        pool_id: null,
        isChange: true,
      },
      currentDivision: selectedDivision,
    }));
    if (!this.state.changesAreMade) {
      this.setState({ changesAreMade: true });
    }
  };

  onSaveTeam = () => {
    const { configurableTeam, teams } = this.state;
    let newTeams = teams;

    if (configurableTeam) {
      let newTeam = configurableTeam;
      if (
        configurableTeam.phone_num &&
        configurableTeam.phone_num.length < 10
      ) {
        newTeam = {
          ...configurableTeam,
          phone_num: null,
        };
      }
      const configurableTeamIndex = teams.findIndex(
        (team) => team.team_id === configurableTeam.team_id
      );
      if (configurableTeamIndex > -1) {
        newTeams[configurableTeamIndex] = newTeam;
      }
      this.setState({
        teams: newTeams,
      });
      this.onSaveClick();
    }

    this.onCloseModal();
  };

  onSavePlayer = () => {
    const { configurablePlayers } = this.state;
    if (configurablePlayers) {
      this.props.savePlayer(configurablePlayers);
    }
    this.onClosePlayerModal();
    this.onCloseChangeTeamPlayerModal();
  };

  onCloseModal = () => {
    this.props.canceledDelete();

    this.setState({
      isEditPopupOpen: false,
      configurableTeam: null,
      currentDivision: null,
    });
  };

  onClosePlayerModal = () => {
    this.setState({
      isEditPlayerPopupOpen: false,
      configurablePlayers: [],
    });
  };

  onCloseChangeTeamPlayerModal = () => {
    this.setState({
      isChangeTeamPlayerPopupOpen: false,
      configurablePlayers: [],
    });
  };

  onImportFromCsv = () => {
    this.setState({ isCsvLoaderOpen: true });
  };

  onPlayerImportFromCsv = () => {
    this.setState({ isPlayerCsvLoaderOpen: true });
  };

  onCsvLoaderClose = () => {
    this.setState({ isCsvLoaderOpen: false });
  };

  onPlayerCsvLoaderClose = () => {
    this.setState({ isPlayerCsvLoaderOpen: false });
  };

  onConfirmModalClose = () => {
    this.setState({ isConfirmModalOpen: false });
  };

  onCancel = () => {
    if (this.state.changesAreMade) {
      this.setState({ isConfirmModalOpen: true });
    } else {
      this.onCancelClick();
    }
  };

  onCreateTeams = async (
    dataToSave: any,
    importMethod: string,
    cb: (param?: object) => void
  ) => {
    if (importMethod === "replace") {
      const { teams } = this.state;
      const { saveTeams } = this.props;
      const newTeams = teams.map((it) => ({ ...it, isDelete: true }));
      await saveTeams(newTeams, cb);
    }
    this.props.createTeamsCsv(dataToSave, cb);
  };

  onCreatePlayers = async (
    dataToSave: any,
    importMethod: string,
    cb: (param?: object) => void
  ) => {
    console.log("importedMethod: ", importMethod, cb);
    if (importMethod === "replace") {
      const { players, deletePlayer } = this.props;
      await deletePlayer(players);
    }
    this.props.createPlayersCsv(dataToSave, cb);
  };

  render() {
    const {
      pools,
      games,
      teams,
      players,
      divisions,
      isLoading,
      isOpenConfirm,
      schedulesNames,
      isOpenDeleteConfirm,
      isLoadingSchedulesAndBracketsNames,
      loadPools,
    } = this.props;

    const {
      configurableTeam,
      currentDivision,
      currentPool,
      isEditPopupOpen,
      isEditPlayerPopupOpen,
      isChangeTeamPlayerPopupOpen,
      configurablePlayers,
    } = this.state;

    if (isLoading) {
      return <Loader />;
    }

    return (
      <>
        <section>
          <Navigation
            onSaveClick={this.onSaveClick}
            onCancelClick={this.onCancel}
          />
          <div className={styles.headingWrapper}>
            <HeadingLevelTwo>Teams & Players Management</HeadingLevelTwo>
          </div>
          <ul className={styles.teamsList}>
            <TeamManagement
              divisions={divisions}
              pools={pools}
              history={this.props.history}
              eventId={this.props.match.params.eventId}
              teams={teams.filter((it) => !it.isDelete)}
              loadPools={loadPools}
              onEditPopupOpen={this.onEditPopupOpen}
              onDeleteAllTeams={this.onDeleteAllTeams}
              onImportFromCsv={this.onImportFromCsv}
            />
            <PlayerManagement
              players={players}
              eventId={this.props.match.params.eventId}
              teams={teams.filter((it) => !it.isDelete)}
              history={this.props.history}
              onChangeTeamPopupOpen={this.onChangeTeamPopupOpen}
              onEditPopupOpen={this.onEditPlayerPopupOpen}
              onChangePlayer={this.onChangePlayer}
              onImportFromCsv={this.onPlayerImportFromCsv}
              onDeletePlayer={this.onDeletePlayer}
              onSavePlayer={this.onSavePlayer}
            />
          </ul>
        </section>
        <Modal isOpen={isEditPopupOpen} onClose={this.onCloseModal}>
          <PopupTeamEdit
            team={configurableTeam}
            divisions={divisions}
            division={currentDivision}
            pool={currentPool}
            games={games}
            componentType={ComponentType.TEAMS_AND_PLAYERS}
            isOpenConfirm={isOpenConfirm}
            schedulesNames={schedulesNames}
            isLoadingNames={isLoadingSchedulesAndBracketsNames}
            isOpenDeleteConfirm={isOpenDeleteConfirm}
            onCheckTeam={this.onCheckTeam}
            onDeleteTeamFromSchedule={this.onDeleteTeamFromSchedule}
            onCloseModal={this.onCloseModal}
            onChangeTeam={this.onChangeTeam}
            onSaveTeamClick={this.onSaveTeam}
            onDeleteTeamClick={this.onDeleteTeam}
            onChangePhoneNumber={this.onChangePhoneNumber}
            onChangeDivision={this.onChangeDivision}
          />
        </Modal>
        <Modal isOpen={isEditPlayerPopupOpen} onClose={this.onClosePlayerModal}>
          <PopupPlayerEdit
            player={configurablePlayers[0]}
            onChangePlayer={this.onChangePlayer}
            onPhoneChange={this.onChangePlayerPhoneNumber}
            onClose={this.onClosePlayerModal}
            onSavePlayer={this.onSavePlayer}
          />
        </Modal>
        <Modal
          isOpen={isChangeTeamPlayerPopupOpen}
          onClose={this.onCloseChangeTeamPlayerModal}
        >
          <PopupPlayerTeamChange
            players={configurablePlayers}
            onChangePlayer={this.onChangePlayer}
            onClose={this.onCloseChangeTeamPlayerModal}
            onSavePlayer={this.onSavePlayer}
          />
        </Modal>
        <PopupExposure
          isOpen={this.state.isConfirmModalOpen}
          onClose={this.onConfirmModalClose}
          onExitClick={this.onCancelClick}
          onSaveClick={this.onSaveClick}
        />
        <CsvLoader
          isOpen={this.state.isCsvLoaderOpen}
          onClose={this.onCsvLoaderClose}
          type="teams"
          onCreate={this.onCreateTeams}
          eventId={this.props.match.params.eventId}
        />
        <CsvLoader
          isOpen={this.state.isPlayerCsvLoaderOpen}
          onClose={this.onPlayerCsvLoaderClose}
          type="players"
          onCreate={this.onCreatePlayers}
          eventId={this.props.match.params.eventId}
        />
      </>
    );
  }
}

export default connect(
  ({ teams }: IAppState) => ({
    games: teams.games,
    teams: teams.teams,
    pools: teams.pools,
    players: teams.players,
    isLoaded: teams.isLoaded,
    isLoading: teams.isLoading,
    divisions: teams.divisions,
    isOpenConfirm: teams.isOpenConfirm,
    schedulesNames: teams.schedulesNames,
    isOpenDeleteConfirm: teams.isOpenDeleteConfirm,
    isLoadingSchedulesAndBracketsNames: teams.isLoadingNames,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      {
        loadPools,
        saveTeams,
        savePlayer,
        deleteTeam,
        deletePlayer,
        loadTeamsData,
        canceledDelete,
        createTeamsCsv,
        createPlayersCsv,
        checkTeamInSchedule,
      },
      dispatch
    )
)(Teams);
