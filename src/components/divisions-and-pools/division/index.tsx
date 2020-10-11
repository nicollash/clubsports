import React from 'react';
import SectionDropdown from '../../common/section-dropdown';
import DivisionDetails from './division-details';
import PoolsDetails from './pools-details';
import CreateIcon from '@material-ui/icons/Create';
import Button from '../../common/buttons/button';
import {
  IDivision,
  IPool,
  ITeam,
  BindingCbWithOne,
  BindingCbWithTwo,
  BindingAction,
} from 'common/models';
import styles from '../styles.module.scss';
import history from '../../../browserhistory';

interface IDivisionProps {
  division: IDivision;
  pools: IPool[];
  teams: ITeam[];
  getPools: BindingCbWithOne<string>;
  onAddPool: BindingCbWithOne<IDivision>;
  areDetailsLoading: boolean;
  eventId: string;
  divisions: IDivision[];
  isSectionExpand: boolean;
  saveTeams: BindingAction;
  editPool: BindingCbWithTwo<IPool, IPool[]>;
  deletePool: BindingCbWithTwo<IPool, ITeam[]>;
  checkTeamInSchedule: BindingCbWithTwo<string, string>;
  deleteTeam: BindingAction;
  onCancel: BindingAction;
  onChange: BindingCbWithOne<ITeam[]>;
  isOpenConfirm: boolean;
  schedulesNames: string[];
  isOpenDeleteConfirm: boolean;
  isLoadingSchedulesAndBracketsNames: boolean;
}

class Division extends React.PureComponent<IDivisionProps> {
  componentDidMount() {
    const { division } = this.props;

    this.props.getPools(division.division_id);
  }

  onEditDivisionDetails = (divisionId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const path = this.props.eventId
      ? `/event/divisions-and-pools-edit/${this.props.eventId}`
      : '/event/divisions-and-pools-edit';
    history.push({
      pathname: path,
      state: { divisionId, pools: this.props.pools, teams: this.props.teams },
    });
  };

  render() {
    const {
      eventId,
      division,
      divisions,
      pools,
      teams,
      checkTeamInSchedule,
      isOpenConfirm,
      schedulesNames,
      isOpenDeleteConfirm,
      isLoadingSchedulesAndBracketsNames,
      saveTeams,
      deleteTeam,
      onChange,
      onCancel,
    } = this.props;

    return (
      <SectionDropdown
        id={division ? division.short_name : ''}
        panelDetailsType="flat"
        expanded={this.props.isSectionExpand}
      >
        <div className={styles.sectionTitle}>
          <div>Division: {division.long_name}</div>
          <div>
            <Button
              label="Edit Division Details"
              variant="text"
              color="secondary"
              icon={<CreateIcon />}
              onClick={this.onEditDivisionDetails(division.division_id)}
            />
          </div>
        </div>
        <div className={styles.sectionContent}>
          <DivisionDetails
            data={division}
            numOfPools={pools.length}
            numOfTeams={teams.length}
          />
          <PoolsDetails
            onAddPool={this.props.onAddPool}
            division={division}
            divisions={divisions}
            pools={pools}
            teams={teams}
            areDetailsLoading={this.props.areDetailsLoading}
            saveTeams={saveTeams}
            editPool={this.props.editPool}
            deletePool={this.props.deletePool}
            eventId={eventId}
            checkTeamInSchedule={checkTeamInSchedule}
            onChange={onChange}
            onCancel={onCancel}
            isOpenConfirm={isOpenConfirm}
            schedulesNames={schedulesNames}
            isOpenDeleteConfirm={isOpenDeleteConfirm}
            isLoadingSchedulesAndBracketsNames={
              isLoadingSchedulesAndBracketsNames
            }
            deleteTeam={deleteTeam}
          />
        </div>
      </SectionDropdown>
    );
  }
}

export default Division;
