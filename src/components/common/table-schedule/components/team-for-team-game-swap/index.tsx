import React, { useState } from "react";
import { IDivision, ISchedulesDetails } from "common/models";
import { ITeam } from "common/models/schedule/teams";
import { Button, Select } from "components/common";
import styles from "./styles.module.scss";

interface Props {
  divisions: IDivision[];
  teams: ITeam[];
  schedulesDetails: ISchedulesDetails[];
  updateSchedulesDetails: (
    modifiedSchedulesDetails: ISchedulesDetails[],
    schedulesDetailsToModify: ISchedulesDetails[]
  ) => void;
}

const TeamForTeamGameSwap = ({
  divisions,
  teams,
  schedulesDetails,
  updateSchedulesDetails,
}: Props) => {
  const [selectedDivisionID, setSelectedDivisionID] = useState("");
  const [selectedDivisionTeams, setSelectedDivisionTeams] = useState<ITeam[]>(
    []
  );
  const [selectedFirstTeamID, setSelectedFirstTeamID] = useState("");
  const [selectedSecondTeamID, setSelectedSecondTeamID] = useState("");

  const mapDivisionsToOptions = () =>
    divisions
      .map((v) => ({ value: v.division_id, label: v.short_name }))
      .sort((a, b) => {
        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        return 0;
      });

  const onDivisionChange = async (e: any) => {
    const selectedDivisionIDFromSelect = e.target.value;
    setSelectedDivisionID(selectedDivisionIDFromSelect);
    setSelectedDivisionTeams(
      teams.filter((v) => v.divisionId === selectedDivisionIDFromSelect)
    );
  };

  const mapTeamsToOptions = (anotherSelectedTeamID: string) => {
    return selectedDivisionTeams
      .map((v) => ({ value: v.id, label: v.name }))
      .filter((v) => v.value !== anotherSelectedTeamID);
  };

  const onTeamChange = (setTeamID: any, anotherSelectedTeamID: string) => {
    return (e: any) => {
      const selectedTeamID = e.target.value;
      if (selectedTeamID !== anotherSelectedTeamID) {
        setTeamID(selectedTeamID);
      }
    };
  };

  const swapTeams = () => {
    const modifiedSchedulesDetails = schedulesDetails.map((v) => {
      const scheduleDetails = { ...v };

      if (scheduleDetails.division_id === selectedDivisionID) {
        if (scheduleDetails.home_team_id === selectedFirstTeamID) {
          scheduleDetails.home_team_id = selectedSecondTeamID;
        } else if (scheduleDetails.home_team_id === selectedSecondTeamID) {
          scheduleDetails.home_team_id = selectedFirstTeamID;
        }

        if (scheduleDetails.away_team_id === selectedFirstTeamID) {
          scheduleDetails.away_team_id = selectedSecondTeamID;
        } else if (scheduleDetails.away_team_id === selectedSecondTeamID) {
          scheduleDetails.away_team_id = selectedFirstTeamID;
        }
      }

      return scheduleDetails;
    });

    const schedulesDetailsToModify = modifiedSchedulesDetails.filter(
      (v) =>
        v.division_id === selectedDivisionID &&
        (v.home_team_id === selectedFirstTeamID ||
          v.away_team_id === selectedSecondTeamID ||
          v.home_team_id === selectedSecondTeamID ||
          v.away_team_id === selectedFirstTeamID)
    );

    updateSchedulesDetails(modifiedSchedulesDetails, schedulesDetailsToModify);
  };

  return (
    <div className={styles.container}>
      <div className={styles.teamSelectWrapper}>
        <Select
          options={mapDivisionsToOptions()}
          value={selectedDivisionID}
          placeholder="Select Division"
          onChange={onDivisionChange}
        />
      </div>
      <div className={styles.teamsSelection}>
        <div className={styles.teamSelectWrapper}>
          <Select
            options={mapTeamsToOptions(selectedSecondTeamID)}
            value={selectedFirstTeamID}
            placeholder="Select First Team"
            onChange={onTeamChange(
              setSelectedFirstTeamID,
              selectedSecondTeamID
            )}
            disabled={!selectedDivisionID}
          />
        </div>

        <Button
          btnStyles={{
            backgroundColor: "#1C315F",
            color: "#fff",
            marginTop: "2px",
          }}
          label="Swap"
          variant="text"
          color="default"
          disabled={!(selectedFirstTeamID && selectedSecondTeamID)}
          onClick={swapTeams}
        >
          Swap
        </Button>

        <div className={styles.teamSelectWrapper}>
          <Select
            options={mapTeamsToOptions(selectedFirstTeamID)}
            value={selectedSecondTeamID}
            placeholder="Select Second Team"
            onChange={onTeamChange(
              setSelectedSecondTeamID,
              selectedFirstTeamID
            )}
            disabled={!selectedDivisionID}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamForTeamGameSwap;
