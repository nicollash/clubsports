import React from 'react';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import PopupPoolEdit from '../popup-pool-edit';
import PoolsDetailsNav from './pools-details-nav';
import Pool from './pool';
import {
  IPool,
  ITeam,
  BindingCbWithOne,
  IDivision,
  BindingCbWithTwo,
  BindingAction,
} from 'common/models';
import {
  Loader,
  Modal,
  DeletePopupConfrim,
  PopupExposure,
  PopupTeamEdit,
} from 'components/common';
import {
  mapTeamWithUnassignedTeams,
  getUnassignedTeamsByPool,
} from '../../helpers';
import styles from './styles.module.scss';
import { ComponentType } from "components/common/popup-team-edit";

const deleteMessage =
  'You are about to delete this team and this cannot be undone. Please, enter the name of the team to continue.';
interface IPoolsDetailsProps {
  onAddPool: BindingCbWithOne<IDivision>;
  division: IDivision;
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
  areDetailsLoading: boolean;
  saveTeams: BindingAction;
  editPool: BindingCbWithTwo<IPool, IPool[]>;
  deletePool: BindingCbWithTwo<IPool, ITeam[]>;
  deleteTeam: BindingAction;
  onCancel: BindingAction;
  checkTeamInSchedule: BindingCbWithTwo<string, string>;
  onChange: BindingCbWithOne<ITeam[]>;
  isOpenConfirm: boolean;
  schedulesNames: string[];
  isOpenDeleteConfirm: boolean;
  isLoadingSchedulesAndBracketsNames: boolean;
  eventId: string;
}

const PoolsDetails = ({
  pools,
  teams,
  division,
  divisions,
  areDetailsLoading,
  isOpenConfirm,
  schedulesNames,
  isOpenDeleteConfirm,
  isLoadingSchedulesAndBracketsNames,
  onAddPool,
  saveTeams,
  editPool,
  deletePool,
  deleteTeam,
  checkTeamInSchedule,
  onChange,
  onCancel,
  eventId,
}: IPoolsDetailsProps) => {
  const [configurableTeam, configutationTeam] = React.useState<ITeam | null>(
    null
  );
  const [currentDivision, changeDivision] = React.useState<IDivision | null>(
    null
  );
  const [currentPoolName, changePoolName] = React.useState<string | null>(null);
  const [isArrange, toggleArrange] = React.useState<boolean>(false);
  const [isEditPopupOpen, toggleEditPopup] = React.useState<boolean>(false);
  const [isDeletePopupOpen, toggleDeletePopup] = React.useState<boolean>(false);
  const [isConfirmPopupOpen, toggleConfirmPopup] = React.useState<boolean>(
    false
  );
  const [changesAreMade, toggleChangesAreMade] = React.useState<boolean>(false);
  const [isEditPoolPoupOpen, toggleEditPoolPoup] = React.useState<boolean>(
    false
  );

  const onCloseModal = () => {
    configutationTeam(null);

    toggleDeletePopup(false);

    toggleEditPopup(false);

    changeDivision(null);

    changePoolName(null);
  };

  const onToggleConfirmPopup = () => {
    onCancel();
    if (changesAreMade) {
      toggleConfirmPopup(!isConfirmPopupOpen);
    } else {
      toggleArrange(false);
    }
  };

  const onToggleArrange = () => toggleArrange(!isArrange);

  const onCancelClick = () => {
    onCancel();

    onToggleConfirmPopup();

    toggleArrange(false);
  };

  const onSaveClick = () => {
    saveTeams();

    toggleArrange(false);

    toggleConfirmPopup(false);
  };

  const onAdd = () => onAddPool(division);

  const changePool = (
    team: ITeam,
    divisionId: string,
    poolId: string | null
  ) => {
    const changedTeam = {
      ...team,
      division_id: divisionId,
      pool_id: poolId,
      isChange: true,
    };

    const changedTeams = teams.map(it =>
      it.team_id === changedTeam.team_id ? changedTeam : it
    );

    onChange(changedTeams);
  };

  const onDeleteTeam = (team: ITeam) => {
    const changedTeams = teams.map(it =>
      it.team_id === team.team_id ? { ...it, isDelete: true } : it
    );

    onChange(changedTeams);

    onCloseModal();
  };

  const onConfirmDeleteTeam = () => onDeleteTeam(configurableTeam!);

  const onDeletePopupOpen = (team: ITeam) => {
    configutationTeam(team);

    toggleDeletePopup(!isDeletePopupOpen);
  };

  const onEditPopupOpen = (
    team: ITeam,
    division: IDivision,
    poolName: string
  ) => {
    toggleEditPopup(!isEditPopupOpen);

    configutationTeam(team);

    changeDivision(division);

    changePoolName(poolName);
  };

  const onChangeTeam = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const editedTeam = {
      ...configurableTeam,
      [name]: value,
      isChange: true,
    } as ITeam;

    configutationTeam(editedTeam);
  };

  const onChangeDivision = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDivision = divisions.find(
      (div: IDivision) => div.division_id === value
    );
    const editedTeam = {
      ...configurableTeam,
      division_id: value,
      pool_id: null,
      isChange: true,
    } as ITeam;

    changeDivision(selectedDivision!);
    configutationTeam(editedTeam);
  };

  const onChangePhoneNumber = (value: string) => {
    const editedTeam = {
      ...configurableTeam,
      phone_num: value,
      isChange: true,
    } as ITeam;

    configutationTeam(editedTeam);
  };

  const onSaveTeam = () => {
    if (configurableTeam) {
      const changedTeams = teams.map(it =>
        it.team_id === configurableTeam.team_id ? configurableTeam : it
      );

      onChange(changedTeams);
    }

    onCloseModal();
  };

  const onToggleEditPoolPoup = () => {
    toggleEditPoolPoup(!isEditPoolPoupOpen);
  };

  const onEditPool = (pool: IPool) => {
    const poolWithSameDivision = pools.filter(
      it => it.division_id === pool.division_id
    );

    editPool(pool, poolWithSameDivision);
  };

  const onDeletePool = (pool: IPool) => {
    const unassignedTeams = getUnassignedTeamsByPool(pool, teams);
    const mappedTeam = mapTeamWithUnassignedTeams(teams, unassignedTeams);

    deletePool(pool, unassignedTeams);

    onChange(mappedTeam);
  };

  const onCheckTeam = (team: ITeam) => {
    checkTeamInSchedule(team.team_id, eventId!);
  };

  const onDeleteTeamFromSchedule = () => {
    deleteTeam();
    onCloseModal();
  };

  const notDeletedTeams = teams.filter((it: ITeam) => !it.isDelete);

  const unassignedTeams = notDeletedTeams.filter(it => !it.pool_id);

  return (
    <>
      <div>
        <div className={styles.headingContainer}>
          <span className={styles.title}>Pools</span>
          <PoolsDetailsNav
            isArrange={isArrange}
            onAdd={onAdd}
            onEdit={onToggleEditPoolPoup}
            onArrange={onToggleArrange}
            onCancel={onToggleConfirmPopup}
            onSave={onSaveClick}
            division={division}
          />
        </div>
        {areDetailsLoading ? (
          <Loader />
        ) : (
          <div className={styles.poolsContainer}>
            <DndProvider backend={HTML5Backend}>
              <Pool
                division={division || null}
                teams={unassignedTeams.filter(
                  team => team.division_id === division.division_id
                )}
                isArrange={isArrange}
                changePool={changePool}
                onDeletePopupOpen={onDeletePopupOpen}
                onEditPopupOpen={onEditPopupOpen}
                toggleChangesAreMade={toggleChangesAreMade}
              />
              {pools.map(pool => (
                <Pool
                  division={division}
                  pool={pool}
                  teams={notDeletedTeams.filter(
                    team => team.pool_id === pool.pool_id && team.division_id === pool.division_id
                  )}
                  key={pool.pool_id}
                  isArrange={isArrange}
                  changePool={changePool}
                  onDeletePopupOpen={onDeletePopupOpen}
                  onEditPopupOpen={onEditPopupOpen}
                  toggleChangesAreMade={toggleChangesAreMade}
                />
              ))}
            </DndProvider>
          </div>
        )}
      </div>
      <Modal
        isOpen={isDeletePopupOpen || isEditPopupOpen}
        onClose={onCloseModal}
      >
        <>
          {isDeletePopupOpen && (
            <DeletePopupConfrim
              type="team"
              message={deleteMessage}
              deleteTitle={configurableTeam?.long_name!}
              isOpen={isDeletePopupOpen}
              onClose={onCloseModal}
              onDeleteClick={onConfirmDeleteTeam}
            />
          )}
          {isEditPopupOpen && (
            <PopupTeamEdit
              team={configurableTeam}
              division={currentDivision}
              divisions={divisions}
              componentType={ComponentType.DIVISIONS_AND_POOLS}
              pool={currentPoolName}
              onChangeTeam={onChangeTeam}
              onChangePhoneNumber={onChangePhoneNumber}
              onSaveTeamClick={onSaveTeam}
              onDeleteTeamClick={onDeleteTeam}
              onCloseModal={onCloseModal}
              onChangeDivision={onChangeDivision}
              games={null}
              isOpenConfirm={isOpenConfirm}
              schedulesNames={schedulesNames}
              isLoadingNames={isLoadingSchedulesAndBracketsNames}
              isOpenDeleteConfirm={isOpenDeleteConfirm}
              onCheckTeam={onCheckTeam}
              onDeleteTeamFromSchedule={onDeleteTeamFromSchedule}
            />
          )}
        </>
      </Modal>
      <PopupExposure
        isOpen={isConfirmPopupOpen}
        onClose={onToggleConfirmPopup}
        onExitClick={onCancelClick}
        onSaveClick={onSaveClick}
      />
      <PopupPoolEdit
        pools={pools}
        isOpen={isEditPoolPoupOpen}
        onClose={onToggleEditPoolPoup}
        onEdit={onEditPool}
        onDelete={onDeletePool}
      />
    </>
  );
};

export default PoolsDetails;
