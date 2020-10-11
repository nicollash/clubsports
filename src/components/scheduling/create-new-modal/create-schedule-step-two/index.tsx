import React from 'react';
import { Input, Button } from '../../../common';
import { ArchitectFormFields } from 'components/scheduling/types';
import styles from '../styles.module.scss';
import { IConfigurableSchedule, ISchedule } from 'common/models/schedule';
import { BindingAction } from 'common/models';

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface ICreateScheduleStepTwoProps {
    schedule: IConfigurableSchedule | ISchedule;
    onChange: (name: string, value: any) => void;
    onCancelClick: () => void;
    chooseOnCreateFunction: BindingAction;
}

const CreateScheduleStepTwo = ({
    schedule,
    onChange,
    onCancelClick,
    chooseOnCreateFunction,
}: ICreateScheduleStepTwoProps) => {

    const localChange = ({ target: { name, value } }: InputTargetValue) => {
        onChange(name, value);
      };

    return (
      <div>
        <div className={styles.inputsWrapper}>
          <Input
            onChange={localChange}
            value={schedule.schedule_name || ''}
            label="Name"
            autofocus={true}
            name={ArchitectFormFields.SCHEDULE_NAME}
          />
          <Input
            onChange={localChange}
            value={schedule.schedule_tag || ''}
            label="Tag"
            name={ArchitectFormFields.SCHEDULT_TAG}
            startAdornment="@"
          />
        </div>
        <div className={styles.firstRow}>
          <div className={styles.infoCell}>
            <span>Divisions:</span>
            <p>{schedule.num_divisions}</p>
          </div>
          <div className={styles.infoCell}>
            <span>Teams:</span>
            <p>{schedule.num_teams}</p>
          </div>
        </div>
        <div className={styles.secondRow}>
          <div className={styles.infoCell}>
            <span>Playoffs:</span>
            <p>Yes</p>
          </div>
          <div className={styles.infoCell}>
            <span>Bracket Type:</span>
            <p>Single Elimination</p>
          </div>
        </div>
        <div className={styles.buttonsWrapper}>
          <Button
            label="Cancel"
            color="secondary"
            variant="text"
            onClick={onCancelClick}
          />
          <Button
            label="Create"
            color="primary"
            variant="contained"
            onClick={chooseOnCreateFunction}
            disabled={!schedule.schedule_name?.length}
          />
        </div>
      </div>
    );
  };

  export default CreateScheduleStepTwo;