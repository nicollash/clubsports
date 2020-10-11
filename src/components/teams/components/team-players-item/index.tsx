import React, { useState } from "react";
import { DeletePopupConfrim, SectionDropdown } from "components/common";
import Button from "components/common/buttons/button";
import { ITeam, IPlayer } from "common/models";
import { Icons, ButtonColors, ButtonVariant, ButtonTypes } from "common/enums";
import { getIcon } from "helpers/get-icon.helper";

import styles from "../division-item/styles.module.scss";
import tableStyles from "../pool-item/styles.module.scss";
import tableBodyStyles from "../team-item/styles.module.scss";

const EDIT_ICON_STYLES = {
  width: "21px",
  marginRight: "5px",
  fill: "#00a3ea",
};

interface Props {
  team: ITeam;
  players: IPlayer[];
  isSectionExpand: boolean;
}

const TeamPlayersItem = ({ team, players, isSectionExpand }: Props) => {
  const [isDeletePopupOpen, onDeletePopup] = useState(false);

  const onDeletePopupClose = () => {
    onDeletePopup(false);
  };

  const teamPlayers: IPlayer[] = players.filter(
    (player) => player.team_id === team.team_id
  );

  const handleDeletePopup = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onDeletePopup(true);
  };

  const handleDeleteAllPlayers = () => {
    onDeletePopupClose();
  };

  const onEdit = () => {
    console.log("onEdit");
  };

  return (
    <li className={styles.divisionItem}>
      <SectionDropdown
        type="section"
        panelDetailsType="flat"
        headingColor="#1C315F"
        expanded={isSectionExpand}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Team: {team.long_name}</span>
          <div className={styles.buttonContainer}>
            {teamPlayers.length > 0 ? (
              <Button
                label="Delete All"
                variant="text"
                color="inherit"
                onClick={handleDeletePopup}
              />
            ) : null}
          </div>
        </div>
        <ul className={styles.poolList}>
          <table className={tableStyles.teamsTable}>
            <thead>
              <tr>
                <th className={tableStyles.teamName}>Player Name</th>
                <th>Jersey Number</th>
                <th>Player Email</th>
                <th>Player Phone</th>
                <th>Player Position</th>
                <th className={tableStyles.teamActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamPlayers.map((player, ind) => (
                <tr key={ind} className={tableBodyStyles.team}>
                  <td className={tableBodyStyles.teamName}>
                    {player.first_name} {player.last_name}
                  </td>
                  <td className={tableBodyStyles.contactName}>
                    {player.jersey_number}
                  </td>
                  <td className={tableBodyStyles.contactName}>
                    {player.player_email}
                  </td>
                  <td className={tableBodyStyles.phone_num}>
                    {player.player_mobile}
                  </td>
                  <td className={tableBodyStyles.contactName}>
                    {player.position}
                  </td>
                  <td className={tableBodyStyles.btnsWrapper}>
                    <Button
                      onClick={onEdit}
                      icon={getIcon(Icons.EDIT, EDIT_ICON_STYLES)}
                      variant={ButtonVariant.TEXT}
                      color={ButtonColors.SECONDARY}
                      type={ButtonTypes.ICON}
                      label="Edit"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ul>
      </SectionDropdown>
      <DeletePopupConfrim
        type={""}
        message={'Type "All Players" to delete'}
        deleteTitle={"All Players"}
        isOpen={isDeletePopupOpen}
        onClose={onDeletePopupClose}
        onDeleteClick={handleDeleteAllPlayers}
      />
    </li>
  );
};

export default TeamPlayersItem;
