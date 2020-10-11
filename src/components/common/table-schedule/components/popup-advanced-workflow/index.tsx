import React, { useState } from 'react';
import { Modal, Button, Radio } from 'components/common';
import styles from './styles.module.scss';
import { AdvancedWorkflowOptionTypes } from 'common/enums/table-schedule';
import TeamForTeamGameSwap from 'components/common/table-schedule/components/team-for-team-game-swap';
import UpdateTimeSlots from 'components/common/table-schedule/components/update-timeslots';
import { IDivision, ISchedulesDetails } from 'common/models';
import { ITeam } from 'common/models/schedule/teams';
import { ITimeValues } from 'helpers';

interface IProps {
  divisions: IDivision[];
  teams: ITeam[];
  timeValues: ITimeValues;
  schedulesDetails: ISchedulesDetails[];
  onScheduleGameUpdate: (gameId: number, gameTime: string) => void;
  updateSchedulesDetails: (
    modifiedSchedulesDetails: ISchedulesDetails[],
    schedulesDetailsToModify: ISchedulesDetails[]
  ) => void;
}

const PopupAdvancedWorkflow = ({
  divisions,
  teams,
  timeValues,
  schedulesDetails,
  onScheduleGameUpdate,
  updateSchedulesDetails,
}: IProps) => {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(AdvancedWorkflowOptionTypes.TEAM_FOR_TEAM_GAME_SWAP);

  const renderSelectedOption = (option: string) => {
    switch (option) {
      case AdvancedWorkflowOptionTypes.TEAM_FOR_TEAM_GAME_SWAP:
        return (
          <TeamForTeamGameSwap
            divisions={divisions}
            teams={teams}
            schedulesDetails={schedulesDetails}
            updateSchedulesDetails={updateSchedulesDetails}
          />
        );
      case AdvancedWorkflowOptionTypes.UPDATE_TIMESLOTS:
        return (
          <UpdateTimeSlots
            schedulesDetails={schedulesDetails}
            timeValues={timeValues}
            onScheduleGameUpdate={onScheduleGameUpdate}
            updateSchedulesDetails={updateSchedulesDetails}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <div className={styles.container}>
      <Button
        btnStyles={{
          backgroundColor: '#1C315F',
          color: '#fff',
          marginLeft: '15px',
          marginBottom: '2px',
        }}
        label="Advanced"
        variant="text"
        color="default"
        onClick={() => setOpen(open => !open)}
      />
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <div className={styles.modalContainer}>
          <div>
            <h4 className={styles.title}>Advanced Settings</h4>
          </div>
          <div>
            <Radio
              options={Object.values(AdvancedWorkflowOptionTypes)}
              checked={selectedOption}
              onChange={(e: any) => setSelectedOption(e.nativeEvent.target.value)}
              row={true}
            />
          </div>
          <div className={styles.selectedOptionComponent}>
            {renderSelectedOption(selectedOption)}
          </div>
          <div className={styles.btnsWrapper}>
            <Button
              label="Close"
              variant="text"
              color="secondary"
              onClick={() => setOpen(false)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PopupAdvancedWorkflow;
