import React from "react";
import PhoneInput from "react-phone-input-2";
import { IPlayer, ITeam, ISelectOption, IDivision } from "common/models";
import { Input, Select } from "components/common";

import styles from "../../create-team/styles.module.scss";

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface ICreatePlayerFormProps {
  index: number;
  onChange: any;
  player: Partial<IPlayer>;
  teams: ITeam[];
  divisions: IDivision[];
}

interface ICreateTeamFormState {
  states: ISelectOption[];
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

class CreatePlayerForm extends React.Component<
  ICreatePlayerFormProps,
  ICreateTeamFormState
> {
  onFirstnameChange = (e: InputTargetValue) => {
    this.props.onChange("first_name", e.target.value, this.props.index);
  };

  onLastnameChange = (e: InputTargetValue) => {
    this.props.onChange("last_name", e.target.value, this.props.index);
  };

  onJerseyNumberChange = (e: InputTargetValue) => {
    this.props.onChange("jersey_number", e.target.value, this.props.index);
  };

  onPlayerEmailChange = (e: InputTargetValue) => {
    this.props.onChange("player_email", e.target.value, this.props.index);
  };

  onPhoneChange = (value: string) => {
    this.props.onChange("player_mobile", value, this.props.index);
  };

  onPositionChange = (e: InputTargetValue) => {
    this.props.onChange("position", e.target.value, this.props.index);
  };

  onTeamChange = (e: InputTargetValue) => {
    this.props.onChange("team_name", e.target.value, this.props.index);
  };

  onDivisionChange = (e: InputTargetValue) => {
    this.props.onChange("division_name", e.target.value, this.props.index);
  };

  // onTeamPlayerIdChange = (e: InputTargetValue) => {
  //   this.props.onChange("team_player_id", e.target.value, this.props.index);
  // };

  render() {
    const {
      first_name,
      last_name,
      jersey_number,
      player_email,
      player_mobile,
      position,
      team_name,
      division_name,
      // team_player_id,
    } = this.props.player;
    const { teams, divisions } = this.props;

    let selectedDivision: IDivision | undefined;
    if (division_name) {
      selectedDivision = divisions.find(
        (division) => division.short_name === division_name
      );
    }

    let divisionTeams: ITeam[] = teams;
    if (selectedDivision) {
      divisionTeams = teams.filter(
        (team) => team.division_id === selectedDivision?.division_id
      );
    }

    const teamOptions = divisionTeams.map((team: ITeam) => ({
      label: team.short_name,
      value: team.short_name,
    }));

    const divisionOptions = divisions.map((division: IDivision) => ({
      label: division.short_name,
      value: division.short_name,
    }));

    return (
      <div className={styles.sectionContainer}>
        <div className={styles.section}>
          <div className={styles.sectionRow}>
            <div className={styles.sectionItem}>
              <Input
                fullWidth={true}
                label="First Name"
                placeholder = "First"
                value={first_name || ""}
                autofocus={true}
                onChange={this.onFirstnameChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <Input
                fullWidth={true}
                label="Last Name"
                placeholder = "Last"
                value={last_name || ""}
                autofocus={true}
                onChange={this.onLastnameChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <Input
                fullWidth={true}
                label="Email *"
                placeholder = "name@gmail.com"
                value={player_email || ""}
                onChange={this.onPlayerEmailChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <div className={styles.title}>Mobile Number *</div>
              <PhoneInput
                country={"us"}
                disableDropdown={true}
                onlyCountries={["us"]}
                disableCountryCode={true}
                placeholder=""
                value={player_mobile || ""}
                onChange={this.onPhoneChange}
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
            </div>
          </div>
          <div className={styles.sectionRow}>
            <div className={styles.sectionItem}>
              <Select
                options={divisionOptions}
                label="Division"
                value={division_name || ""}
                onChange={this.onDivisionChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <Select
                options={teamOptions}
                label="Team"
                value={team_name || ""}
                onChange={this.onTeamChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <Input
                fullWidth={true}
                label="Jersey Number"
                placeholder = "Numbers Only"
                value={jersey_number || ""}
                autofocus={true}
                onChange={this.onJerseyNumberChange}
              />
            </div>
            <div className={styles.sectionItem}>
              <Select
                options={positions}
                label="Position"
                value={position || ""}
                onChange={this.onPositionChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CreatePlayerForm;
