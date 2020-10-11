import React from 'react';
import { connect } from 'react-redux';
import styles from '../../styles.module.scss';
import { Input, Button, Select } from 'components/common';
import { BindingCbWithTwo, ISelectOption, ITeamItem } from 'common/models';
import { ITeamsRegister } from 'common/models/register';
import { addBlankTeam, deleteTeam, updateTeam } from '../logic/actions';

interface ITeamProps {
  data: Partial<ITeamsRegister>;
  onChange: BindingCbWithTwo<string, string | number>;
  divisions: ISelectOption[];
  states: ISelectOption[];
  teams: ITeamItem[];
  isInvited: boolean;
  addBlankTeam: () => void;
  deleteTeam: (team: ITeamItem) => void;
  updateTeam: (team: ITeamItem) => void;
}

const Team = ({
  data,
  onChange,
  divisions,
  states,
  isInvited,
  teams,
  addBlankTeam,
  deleteTeam,
  updateTeam,
}: ITeamProps) => {
  const onTeamCityChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('team_city', e.target.value);

  const onTeamStateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('team_state', e.target.value);

  const onTeamFieldChange = (
    team: ITeamItem,
    fieldName: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    team[fieldName] = e.target.value;
    updateTeam(team);
  };

  const onDivisionChange = (
    team: ITeamItem,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    team.ext_sku = e.target.value;
    team.division_name = divisions.find(
      div => div.value === e.target.value
    )?.label;
    updateTeam(team);
  };

/*   const onTeamWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('team_website', e.target.value); */

  return (
    <div className={styles.section}>
      {teams.map((team, index) => (
        <div className={styles.sectionRow} key={team.id}>
          <div className={styles.sectionItem}>
            <Select
              options={divisions}
              label={index === 0 ? 'Division' : undefined}
              value={team.ext_sku || ''}
              onChange={(e: any) => onDivisionChange(team, e)}
              isRequired={true}
              disabled={isInvited}
            />
          </div>
          <div className={styles.sectionItem}>
            <Input
              fullWidth={true}
              label={index === 0 ? 'Team Name' : undefined}
              value={team.team_name || ''}
              onChange={(e: any) => onTeamFieldChange(team, 'team_name', e)}
              isRequired={true}
            />
          </div>
          {index !== 0 && (
            <div className={styles.sectionItem}>
              <Button
                variant='outlined'
                color='primary'
                label='Remove Team'
                onClick={() => deleteTeam(team)}
              />
            </div>
          )}
          {index === 0 && (
            <>
              <div className={styles.sectionItem}>
                <Input
                  fullWidth={true}
                  label='City'
                  value={data.team_city || ''}
                  onChange={onTeamCityChange}
                  isRequired={true}
                />
              </div>
              <div className={styles.sectionItem}>
                <Select
                  options={states}
                  label='State'
                  value={data.team_state || ''}
                  onChange={onTeamStateChange}
                  isRequired={true}
                />
              </div>
            </>
          )}
        </div>
      ))}
      <div className={styles.sectionRow}>
        <Button
          label='+ Register Additional Team'
          variant='text'
          color='secondary'
          onClick={addBlankTeam}
        />
      </div>
{/*       <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <Input
            fullWidth={true}
            label='Team Website'
            value={data.team_website || ''}
            onChange={onTeamWebsiteChange}
          />
        </div>
      </div> */}
    </div>
  );
};

const mapStateToProps = (state: { regTeams: { teams: ITeamItem[] } }) => ({
  teams: state.regTeams.teams,
});

const mapDispatchToProps = { addBlankTeam, deleteTeam, updateTeam };

export default connect(mapStateToProps, mapDispatchToProps)(Team);
