import React from 'react';
import Button from 'components/common/buttons/button';
import { getIcon } from 'helpers/get-icon.helper';
import { ITeam, IDivision } from 'common/models';
import { Icons, ButtonColors, ButtonVariant, ButtonTypes } from 'common/enums';
import styles from './styles.module.scss';
import { formatPhoneNumber } from 'helpers/formatPhoneNumber';
import { ButtonCopy } from 'components/common';

const EDIT_ICON_STYLES = {
  width: '21px',
  marginRight: '5px',
  fill: '#00a3ea',
};

interface Props {
  team: ITeam;
  division: IDivision;
  poolName?: string;
  onEditPopupOpen: (team: ITeam, division: IDivision, poolName: string) => void;
}

const TeamItem = ({ team, division, poolName, onEditPopupOpen }: Props) => {
  const onEdit = () => onEditPopupOpen(team, division, poolName || '');

  const inviteLink = `${window.location.origin.toString()}/register/event/${
    division.event_id
  }?team=${encodeURIComponent(team.long_name!)}&team_id=${
    team.team_id
  }&division=${encodeURIComponent(division.short_name)}&division_id=${
    division.division_id
  }`;

  return (
    <tr className={styles.team}>
      <td className={styles.teamName}>{team.short_name}</td>
      <td className={styles.contactName}>{`${team.contact_first_name ||
        ''} ${team.contact_last_name || ''}`}</td>
      <td className={styles.phone_num}>
        {team.phone_num ? formatPhoneNumber(team.phone_num) : ''}
      </td>
      <td className={styles.btnsWrapper}>
        <Button
          onClick={onEdit}
          icon={getIcon(Icons.EDIT, EDIT_ICON_STYLES)}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          type={ButtonTypes.ICON}
          label="Edit team"
        />
      </td>
      <td className={styles.btnsCopyWrapper}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ButtonCopy
            copyString={inviteLink}
            label={'Link'}
            color={ButtonColors.SECONDARY}
            variant={ButtonVariant.TEXT}
            style={{
              width: '70px',
            }}
          />
        </div>
      </td>
    </tr>
  );
};

export default TeamItem;
