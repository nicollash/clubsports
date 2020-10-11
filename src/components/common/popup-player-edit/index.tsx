import React from "react";
import { useSelector } from "react-redux";
import { HeadingLevelThree, Button, Input, Select } from "components/common";
import PhoneInput from "react-phone-input-2";
import { IPlayer } from "common/models";
import { IAppState } from "reducers/root-reducer.types";

import styles from "../popup-team-edit/styles.module.scss";

enum FORM_FIELDS {
  FIRST_NAME = "first_name",
  LAST_NAME = "last_name",
  EMAIL = "player_email",
  JERSEY_NUMBER = "jersey_number",
  DIVISION = "division_name",
  TEAM = "team_name",
  POSITION = "position",
}

interface Props {
  player: IPlayer | null;
  onChangePlayer: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (phoneNumber: string) => void;
  onSavePlayer: () => void;
  onClose: () => void;
}

const positions = [
  { label: "Attack", value: "Attack" },
  { label: "Attack/Middie", value: "Attack/Middie" },
  { label: "Middie", value: "Middie" },
  { label: "Defense", value: "Defense" },
  { label: "Fogo", value: "Fogo" },
  { label: "Goalie", value: "Goalie" },
  { label: "LSM", value: "LSM" },
  { label: "Other", value: "Other" },
];

const PlayerDetailsPopup = ({
  player,
  onChangePlayer,
  onPhoneChange,
  onSavePlayer,
  onClose,
}: Props) => {
  const { teams, divisions } = useSelector((state: IAppState) => state.teams);

  const divisionOptions = divisions.map((division) => ({
    value: division.short_name,
    label: division.short_name,
  }));

  let teamsOptions = teams.map((team) => ({
    value: team.short_name,
    label: team.short_name,
  }));

  if (player && player.division_name) {
    const newDivision = divisions.find(
      (division) => division.short_name === player.division_name
    );
    const newTeams = teams.filter(
      (team) => team.division_id === newDivision?.division_id
    );
    teamsOptions = newTeams.map((team) => ({
      value: team.short_name,
      label: team.short_name,
    }));
  }

  return (
    <div className={styles.popupWrapper}>
      <div className={styles.headerWrapper}>
        <HeadingLevelThree color="#1C315F">Edit Player</HeadingLevelThree>
      </div>
      <div>
        <Input
          fullWidth={true}
          label="First Name"
          placeholder = "First"
          value={player?.first_name}
          name={FORM_FIELDS.FIRST_NAME}
          autofocus={true}
          onChange={onChangePlayer}
        />
        <Input
          fullWidth={true}
          label="Last Name"
          placeholder = "Last"
          value={player?.last_name}
          name={FORM_FIELDS.LAST_NAME}
          onChange={onChangePlayer}
        />
        <Input
          fullWidth={true}
          label="Email"
          placeholder = "name@gmail.com"
          value={player?.player_email}
          name={FORM_FIELDS.EMAIL}
          onChange={onChangePlayer}
        />
        <span className={styles.modalLabel}>Phone</span>
        <PhoneInput
          country={"us"}
          onlyCountries={["us", "ca"]}
          placeholder=""
          disableCountryCode={true}
          value={player?.player_mobile}
          onChange={onPhoneChange}
          containerStyle={{ marginTop: "7px" }}
          inputStyle={{
            height: "42px",
            fontSize: "18px",
            color: "#6a6a6a",
            borderRadius: "4px",
            width: "100%",
          }}
          inputClass={styles.phoneInput}
        />
        <Select
          options={divisionOptions}
          label="Division"
          name={FORM_FIELDS.DIVISION}
          value={player?.division_name || ""}
          onChange={onChangePlayer}
        />
        <Select
          options={teamsOptions}
          label="Team"
          name={FORM_FIELDS.TEAM}
          value={player?.team_name || ""}
          onChange={onChangePlayer}
        />
        <Input
          fullWidth={true}
          label="Jersey Number"
          placeholder = "00"
          value={player?.jersey_number}
          name={FORM_FIELDS.JERSEY_NUMBER}
          onChange={onChangePlayer}
        />
        <Select
          options={positions}
          label="Position"
          name={FORM_FIELDS.POSITION}
          value={player?.position || ""}
          onChange={onChangePlayer}
        />
      </div>
      <div style={{ marginTop: 10 }}>
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

export default PlayerDetailsPopup;
