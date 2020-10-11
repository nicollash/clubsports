import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { IPlayer, ITeam, IDivision } from "common/models";
import { HeadingLevelThree, Button, Select } from "components/common";
import { IAppState } from "reducers/root-reducer.types";

import styles from "../popup-team-edit/styles.module.scss";

interface Props {
  players: IPlayer[];
  onSavePlayer: () => void;
  onChangePlayer: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

enum FORM_FIELDS {
  DIVISION = "division_name",
  TEAM = "team_name",
}

const PlayerChangeTeamPopup = ({
  players,
  onSavePlayer,
  onChangePlayer,
  onClose,
}: Props) => {
  const [currentTeam, setCurrentTeam] = useState<ITeam | null>(null);
  const [currentDivision, setCurrentDivision] = useState<IDivision | null>(
    null
  );
  const { teams, divisions } = useSelector((state: IAppState) => state.teams);

  useEffect(() => {
    if (teams && divisions && players.length > 0) {
      const curTeam = teams.find((team) => team.team_id === players[0].team_id);
      if (curTeam) {
        setCurrentTeam(curTeam);
        const curDivision = divisions.find(
          (division) => division.division_id === curTeam.division_id
        );
        setCurrentDivision(curDivision ? curDivision : null);
      }
    }
  }, [teams, divisions, players]);

  const divisionOptions = divisions.map((division) => ({
    value: division.short_name,
    label: division.short_name,
  }));

  let teamsOptions = teams.map((team) => ({
    value: team.short_name,
    label: team.short_name,
  }));

  if (currentDivision) {
    const newTeams = teams.filter(
      (team) => team.division_id === currentDivision.division_id
    );
    teamsOptions = newTeams.map((team) => ({
      value: team.short_name,
      label: team.short_name,
    }));
  }
  let newTeamsOptions = teams.map((team) => ({
    value: team.short_name,
    label: team.short_name,
  }));
  if (players.length > 0 && players[0].division_name) {
    const newDivision = divisions.find(
      (division) => division.short_name === players[0].division_name
    );
    const newTeams = teams.filter(
      (team) => team.division_id === newDivision?.division_id
    );
    newTeamsOptions = newTeams.map((team) => ({
      value: team.short_name,
      label: team.short_name,
    }));
  }

  if (!players || players.length === 0) {
    return null;
  }

  return (
    <div className={styles.popupWrapper}>
      <div className={styles.headerWrapper}>
        <HeadingLevelThree color="#1C315F">
          Change Player Assignment
        </HeadingLevelThree>
      </div>
      {players.length === 1 && (
        <div className={styles.sectionRow}>
          <div className={styles.sectionItem}>
            <Select
              options={divisionOptions}
              label="Current Division"
              disabled={true}
              value={currentDivision?.short_name || ""}
            />
          </div>
          <div className={styles.sectionItem}>
            <Select
              options={teamsOptions}
              label="Current Team"
              disabled={true}
              value={currentTeam?.short_name || ""}
            />
          </div>
        </div>
      )}
      <div className={styles.sectionRow}>
        <div className={styles.sectionItem}>
          <Select
            options={divisionOptions}
            label="New Division"
            name={FORM_FIELDS.DIVISION}
            value={players[0].division_name || ""}
            onChange={onChangePlayer}
          />
        </div>
        <div className={styles.sectionItem}>
          <Select
            options={newTeamsOptions}
            label="New Team"
            name={FORM_FIELDS.TEAM}
            value={players[0].team_name || ""}
            onChange={onChangePlayer}
          />
        </div>
      </div>
      <div>
        <Button
          onClick={onClose}
          label="Cancel"
          variant="text"
          color="secondary"
        />
        <Button
          onClick={onSavePlayer}
          label="Save"
          variant="contained"
          color="primary"
        />
      </div>
    </div>
  );
};

export default PlayerChangeTeamPopup;
