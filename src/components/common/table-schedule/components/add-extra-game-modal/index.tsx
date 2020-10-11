import React, { useState } from "react";
import { GameType } from "components/common/matrix-table/dnd/drop";
import styles from "../../styles.module.scss";
import { Modal, Input, Button, Select } from "components/common";
import { ITeamCard } from "common/models/schedule/teams";
import { IEventDetails, IDivision } from "common/models";
import { getVarcharEight } from "helpers";
import { IGame } from "components/common/matrix-table/helper";

interface IProps {
  isOpen: boolean;
  closeModal: () => void;
  onSave: (
    gameType: GameType.allstar | GameType.practice,
    eventId: string,
    divisionId: string,
    game: IGame,
    awayTeamId: string,
    homeTeamId: string,
    awayTeamName?: string,
    homeTeamName?: string
  ) => void;
  gameType: GameType.allstar | GameType.practice;
  game: IGame;
  event: IEventDetails;
  divisions: IDivision[];
  teamCards: ITeamCard[];
}

const AddExtraGameModal = (props: IProps) => {
  const {
    isOpen,
    closeModal,
    onSave,
    gameType,
    game,
    event,
    divisions,
    teamCards,
  } = props;
  const [selectedDivisionID, setSelectedDivisionID] = useState("");
  const [selectedDivisionTeams, setSelectedDivisionTeams] = useState<
    ITeamCard[]
  >([]);
  const [selectedAwayTeamID, setSelectedAwayTeamID] = useState("");
  const [selectedHomeTeamID, setSelectedHomeTeamID] = useState("");
  const [awayAllStarTeamName, setAwayAllStarName] = useState("");
  const [homeAllStarTeamName, setHomeAllStarName] = useState("");

  const mapDivisionsToOptions = () =>
    divisions
      .sort((a, b) => {
        if (a.short_name > b.short_name) {
          return 1;
        }
        if (b.short_name > a.short_name) {
          return -1;
        }
        return 0;
      })
      .map((v) => ({ value: v.division_id, label: v.short_name }));

  const onDivisionChange = async (e: any) => {
    const selectedDivisionIDFromSelect = e.target.value;
    setSelectedDivisionID(selectedDivisionIDFromSelect);
    setSelectedDivisionTeams(
      teamCards.filter((v) => v.divisionId === selectedDivisionIDFromSelect)
    );
  };

  const mapTeamsToOptions = (anotherSelectedTeamID: string) => {
    return selectedDivisionTeams
      .map((v) => ({ value: v.id, label: v.name }))
      .filter((v) => v.value !== anotherSelectedTeamID);
  };

  const onSelectTeamChange = (
    setTeamID: any,
    anotherSelectedTeamID: string
  ) => {
    return (e: any) => {
      const selectedTeamID = e.target.value;
      if (selectedTeamID !== anotherSelectedTeamID) {
        setTeamID(selectedTeamID);
      }
    };
  };

  const onAllStarTeamChange = (
    setAllStarTeamName: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const allStarTeamName = e.target.value;
    setAllStarTeamName(allStarTeamName);
  };

  const onModalClose = () => {
    setSelectedDivisionID("");
    setSelectedDivisionTeams([]);
    setSelectedAwayTeamID("");
    setSelectedHomeTeamID("");
    setAwayAllStarName("");
    setHomeAllStarName("");
    closeModal();
  };

  const onAllStarGameSave = () => {
    onSave(
      gameType,
      event.event_id,
      selectedDivisionID,
      game,
      getVarcharEight(),
      getVarcharEight(),
      awayAllStarTeamName,
      homeAllStarTeamName
    );
    onModalClose();
  };

  const renderAllStarForm = () => {
    return (
      <form className={styles.formWrapperAllstar}>
        <div className={styles.selectBar}>
          <div className={styles.selectWrap}>
            <Select
              options={mapDivisionsToOptions()}
              label="Division"
              value={selectedDivisionID}
              width="180px"
              placeholder="Select division"
              onChange={onDivisionChange}
            />
          </div>
          <Input
            type="text"
            label="Away Team"
            value={awayAllStarTeamName}
            width="180px"
            placeholder="Away Team Name"
            onChange={onAllStarTeamChange(setAwayAllStarName)}
            disabled={!selectedDivisionID}
          />
          <Input
            type="text"
            label="Home Team"
            value={homeAllStarTeamName}
            width="180px"
            placeholder="Home Team Name"
            onChange={onAllStarTeamChange(setHomeAllStarName)}
            disabled={!selectedDivisionID}
          />
        </div>
        <div className={styles.controlModalZone}>
          <div className={styles.buttonControl}>
            <Button
              label="Cancel"
              variant="outlined"
              color="primary"
              onClick={onModalClose}
            />
          </div>
          <div className={styles.buttonControl}>
            <Button
              label="Save"
              variant="contained"
              color="primary"
              onClick={onAllStarGameSave}
              disabled={
                !selectedDivisionID ||
                !awayAllStarTeamName ||
                !homeAllStarTeamName
              }
            />
          </div>
        </div>
      </form>
    );
  };

  const onPracticeGameSave = () => {
    onSave(
      gameType,
      event.event_id,
      selectedDivisionID,
      game,
      selectedAwayTeamID,
      selectedHomeTeamID
    );
    onModalClose();
  };

  const renderPracticeForm = () => {
    return (
      <form className={styles.formWrapperPractice}>
        <div className={styles.selectBar}>
          <div className={styles.selectWrap}>
            <Select
              options={mapDivisionsToOptions()}
              label="Division"
              value={selectedDivisionID}
              width="180px"
              placeholder="Select division"
              onChange={onDivisionChange}
            />
          </div>
          <div className={styles.selectWrap}>
            <Select
              options={mapTeamsToOptions(selectedHomeTeamID)}
              label="Away Team"
              value={selectedAwayTeamID}
              width="180px"
              placeholder="Select away team"
              onChange={onSelectTeamChange(
                setSelectedAwayTeamID,
                selectedHomeTeamID
              )}
              disabled={!selectedDivisionID}
            />
          </div>
          <div className={styles.selectWrap}>
            <Select
              options={mapTeamsToOptions(selectedAwayTeamID)}
              label="Home Team"
              value={selectedHomeTeamID}
              width="180px"
              placeholder="Select home team"
              onChange={onSelectTeamChange(
                setSelectedHomeTeamID,
                selectedAwayTeamID
              )}
              disabled={!selectedDivisionID}
            />
          </div>
        </div>
        <div className={styles.controlModalZone}>
          <div className={styles.buttonControl}>
            <Button
              label="Cancel"
              variant="outlined"
              color="primary"
              onClick={onModalClose}
            />
          </div>
          <div className={styles.buttonControl}>
            <Button
              label="Save"
              variant="contained"
              color="primary"
              onClick={onPracticeGameSave}
              disabled={
                !selectedDivisionID ||
                !selectedAwayTeamID &&
                !selectedHomeTeamID
              }
            />
          </div>
        </div>
      </form>
    );
  };

  const renderForm = () => {
    switch (gameType) {
      case GameType.allstar:
        return renderAllStarForm();
      case GameType.practice:
        return renderPracticeForm();
    }
  };

  const getModalHeader = () => {
    switch (gameType) {
      case GameType.allstar:
        return "All-Star Game";
      case GameType.practice:
        return "Practice Game";
    }
  };

  const getModalDescription = () => {
    switch (gameType) {
      case GameType.allstar:
        return "Select the Division and Name the All Star Teams";
      case GameType.practice:
        return "Select the Division and Teams for practice";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onModalClose}>
      <div className={styles.modalWrapper}>
        <h2 className={styles.modalName}>{getModalHeader()}</h2>
        <h3 className={styles.modalDescription}>{getModalDescription()}</h3>
        {renderForm()}
      </div>
    </Modal>
  );
};

export default AddExtraGameModal;
