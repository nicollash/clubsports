/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import styles from '../../styles.module.scss';
import { Input, HeadingLevelFour } from 'components/common';
import { BindingCbWithOne, ITeamItem } from 'common/models';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/high-res.css';
import { ITeamsRegister } from 'common/models/register';
import EmailInput from 'components/common/email-input';
import { updateTeam } from '../logic/actions';
import { CardMessageTypes } from 'components/common/card-message/types';
import { CardMessage} from "components/common";

const CARD_MESSAGE_STYLES = {
  marginBottom: 0,
  width: "100%",
};

interface ICoachInfoProps {
  data: Partial<ITeamsRegister>;
  teams: ITeamItem[];
  updateTeam: BindingCbWithOne<ITeamItem>;
}

const CoachInfo = ({ data, teams, updateTeam }: ICoachInfoProps) => {
  useEffect(() => {
    if (data.contact_is_also_the_coach) {
      const info = {
        coach_first_name: data.contact_first_name,
        coach_last_name: data.contact_last_name,
        coach_mobile: data.contact_mobile,
        coach_email: data.contact_email,
      };
      for (const team of teams) {
        if (!team.coach_first_name && !team.coach_last_name) {
          const updatedTeam = { ...team, ...info };
          updateTeam(updatedTeam);
        }
      }
    }
  }, []);

  const onTeamFieldChange = (
    team: ITeamItem,
    fieldName: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    team[fieldName] = e.target?.value;
    updateTeam(team);
  };

  return (
    <div className={styles.section}>
      <CardMessage style={CARD_MESSAGE_STYLES} type={CardMessageTypes.EMODJI_OBJECTS}> 
         Entering in valid coaches details enable our field managers to call the coaches with event day issues rather than you!
      </CardMessage>
      {teams.map(team => (
        <div key={team.id}>
          <div className={styles.sectionRow}>
            <HeadingLevelFour>
              <span>
                Team: {team.team_name} ({team.division_name})
              </span>
            </HeadingLevelFour>
          </div>
          <div className={styles.sectionRow}>
            <div className={styles.sectionItem}>
              <Input
                fullWidth={true}
                label='First Name'
                value={team.coach_first_name || ''}
                onChange={(e: any) =>
                  onTeamFieldChange(team, 'coach_first_name', e)
                }
                isRequired={true}
              />
            </div>
            <div className={styles.sectionItem}>
              <Input
                fullWidth={true}
                label='Last Name'
                value={team.coach_last_name || ''}
                onChange={(e: any) =>
                  onTeamFieldChange(team, 'coach_last_name', e)
                }
                isRequired={true}
              />
            </div>
            <div className={styles.sectionItem}>
              <EmailInput
                fullWidth={true}
                label='Email *'
                value={team.coach_email || ''}
                isRequired={true}
                onChange={(e: any) => onTeamFieldChange(team, 'coach_email', e)}
                onError={error => {
                  console.log(error);
                }}
              />
            </div>
            <div className={styles.sectionItem}>
              <div className={styles.sectionContainer}>
                <span className={styles.sectionTitle}>Phone Number</span>
                <PhoneInput
                  country={'us'}
                  // disableDropdown
                  onlyCountries={['us', 'ca']}
                  disableCountryCode={false}
                  placeholder=''
                  value={team.coach_mobile || ''}
                  onChange={(e: any) =>
                    onTeamFieldChange(team, 'coach_mobile', e)
                  }
                  containerStyle={{ marginTop: '7px' }}
                  inputStyle={{
                    height: '40px',
                    fontSize: '18px',
                    color: '#6a6a6a',
                    borderRadius: '4px',
                    width: '100%',
                  }}
                  inputProps={{
                    required: true,
                    minLength: 14,
                  }}
                />
              </div>
            </div>
           </div>
          </div>
      
      ))
      }
    </div>
  );
};

const mapStateToProps = (state: { regTeams: { teams: ITeamItem[] } }) => ({
  teams: state.regTeams.teams,
});

const mapDispatchToProps = { updateTeam };

export default connect(mapStateToProps, mapDispatchToProps)(CoachInfo);
