import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch, bindActionCreators } from 'redux';
import { IAppState } from 'reducers/root-reducer.types';
import { sortByField } from 'helpers';
import {
  IDivision,
  IPool,
  ITeamWithResults,
  BindingCbWithOne,
  ISchedulesGameWithNames,
  IMenuItem,
  ITeam,
  IEventDetails,
} from 'common/models';
import { SortByFilesTypes } from 'common/enums';
import {
  HeadingLevelTwo,
  Modal,
  Loader,
  PopupTeamEdit,
  HazardList,
} from 'components/common';
import Button from 'components/common/buttons/button';
import Navigation from './components/navigation';
import ListStatistic from './components/list-statistic';
import ScoringItem from './components/scoring-Item';
import {
  loadScoringData,
  loadPools,
  editTeam,
  deleteTeam,
} from './logic/actions';
import styles from './styles.module.scss';
import { ComponentType } from "components/common/popup-team-edit";

interface MatchParams {
  eventId: string;
}

interface Props {
  isLoading: boolean;
  isLoaded: boolean;
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeamWithResults[];
  games: ISchedulesGameWithNames[];
  event: IEventDetails | null;
  incompleteMenuItems: IMenuItem[];
  loadScoringData: (eventId: string) => void;
  loadPools: (divisionId: string) => void;
  editTeam: BindingCbWithOne<ITeamWithResults>;
  deleteTeam: (teamId: string) => void;
}

interface State {
  changeableTeam: ITeamWithResults | null;
  currentDivision: IDivision | null;
  currentPool: string | null;
  isModalOpen: boolean;
  isSectionsExpand: boolean;
}

class Sсoring extends React.Component<
  Props & RouteComponentProps<MatchParams>,
  State
> {
  constructor(props: Props & RouteComponentProps<MatchParams>) {
    super(props);

    this.state = {
      currentDivision: null,
      currentPool: null,
      changeableTeam: null,
      isModalOpen: false,
      isSectionsExpand: false,
    };
  }

  componentDidMount() {
    const {
      loadScoringData,
      match: {
        params: { eventId },
      },
    } = this.props;

    if (eventId) {
      loadScoringData(eventId);
    }
  }

  onSaveTeam = () => {
    const { changeableTeam } = this.state;
    const { editTeam } = this.props;

    if (changeableTeam) {
      editTeam(changeableTeam);
    }

    this.onCloseModal();
  };

  onDeleteTeam = (team: ITeamWithResults | ITeam) => {
    const { deleteTeam } = this.props;

    deleteTeam(team.team_id);

    this.onCloseModal();
  };

  onChangeTeam = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value, name },
    } = evt;

    this.setState(({ changeableTeam }) => ({
      changeableTeam: {
        ...(changeableTeam as ITeamWithResults),
        [name]: value,
      },
    }));
  };

  onChangePhoneNumber = (value: string) => {
    this.setState(({ changeableTeam }) => ({
      changeableTeam: {
        ...(changeableTeam as ITeamWithResults),
        phone_num: value,
      },
    }));
  };

  onOpenTeamDetails = (
    team: ITeamWithResults,
    division: IDivision,
    poolName: string
  ) => {
    this.setState({
      isModalOpen: true,
      changeableTeam: team,
      currentDivision: division,
      currentPool: poolName,
    });
  };

  onCloseModal = () =>
    this.setState({
      isModalOpen: false,
      changeableTeam: null,
      currentDivision: null,
      currentPool: null,
    });

  toggleSectionCollapse = () => {
    this.setState({ isSectionsExpand: !this.state.isSectionsExpand });
  };

  render() {
    const {
      isModalOpen,
      isSectionsExpand,
      changeableTeam,
      currentDivision,
      currentPool,
    } = this.state;

    const {
      isLoading,
      match: {
        params: { eventId },
      },
      pools,
      teams,
      divisions,
      loadPools,
      games,
      event,
      incompleteMenuItems,
    } = this.props;

    const isAllowViewPage = incompleteMenuItems.length === 0;

    if (!isAllowViewPage) {
      return (
        <HazardList
          incompleteMenuItems={incompleteMenuItems}
          eventId={eventId}
        />
      );
    }

    if (isLoading) {
      return <Loader />;
    }

    const sortedDivisions = sortByField(divisions, SortByFilesTypes.DIVISIONS);

    return (
      <section>
        <Navigation eventId={eventId} />
        <div className={styles.headingWrapper}>
          <HeadingLevelTwo>Scoring</HeadingLevelTwo>
          {divisions?.length ? (
            <Button
              label={isSectionsExpand ? 'Collapse All' : 'Expand All'}
              variant="text"
              color="secondary"
              onClick={this.toggleSectionCollapse}
            />
          ) : null}
        </div>
        <ListStatistic games={games} />
        <ul className={styles.scoringList}>
          {sortedDivisions.map(division => (
            <ScoringItem
              event={event}
              division={division}
              pools={pools.filter(
                pool => pool.division_id === division.division_id
              )}
              teams={teams}
              games={games}
              loadPools={loadPools}
              onOpenTeamDetails={this.onOpenTeamDetails}
              key={division.division_id}
              isSectionExpand={isSectionsExpand}
            />
          ))}
        </ul>

        <Modal isOpen={isModalOpen} onClose={this.onCloseModal}>
          <PopupTeamEdit
            contactId={''} // default contact in the team
            team={changeableTeam}
            division={currentDivision}
            divisions={divisions}
            pool={currentPool}
            componentType={ComponentType.SCORING}
            onSaveTeamClick={this.onSaveTeam}
            onDeleteTeamClick={this.onDeleteTeam}
            onChangeTeam={this.onChangeTeam}
            onChangePhoneNumber={this.onChangePhoneNumber}
            onCloseModal={this.onCloseModal}
            games={games}
          />
        </Modal>
      </section>
    );
  }
}

export default connect(
  ({ scoring, pageEvent }: IAppState) => ({
    isLoading: scoring.isLoading,
    isLoaded: scoring.isLoaded,
    divisions: scoring.divisions,
    pools: scoring.pools,
    teams: scoring.teams,
    games: scoring.games,
    event: pageEvent.tournamentData.event,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      { loadScoringData, loadPools, deleteTeam, editTeam },
      dispatch
    )
)(Sсoring);
