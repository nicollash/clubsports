import React, { useState, useEffect } from 'react';
import {
    Radio,
    Button,
    Checkbox,
  } from '../../../common';

import {
getScheduleCreationTypeOptions,
mapScheduleCreationTypeToOption,
ScheduleCreationType,
mapScheduleCreationOptionToType,
} from '../helpers';
import styles from '../styles.module.scss';
import { BindingAction, BindingCbWithOne } from 'common/models';

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface ICreateScheduleStepOneProps {
  isMatchupsOnly: boolean;
  onChangeMatchupsOnly: BindingAction;
  setNextStep: BindingCbWithOne<number>;
  setSelectedType: BindingCbWithOne<ScheduleCreationType>;
};

const CreateScheduleStepOne = ({
    isMatchupsOnly, 
    onChangeMatchupsOnly,
    setNextStep,
    setSelectedType,
}: ICreateScheduleStepOneProps) => {
    const [type, setType] = useState(ScheduleCreationType.Scheduler);

    useEffect(() => {
        return () => setSelectedType(type);
    });

    const onTypeChange = (e: InputTargetValue) =>
    setType(mapScheduleCreationOptionToType(e.target.value));

    return (
        <div>
            <p className={styles.message}>
                Do you want to use 'Scheduling Algorithm', 'Visual Games Maker' or
                create schedule manually?
            </p>
            <div className={styles.optionsContainer}>
                <div className={styles.radioBtnsWrapper}>
                    <Radio
                        options={getScheduleCreationTypeOptions()}
                        onChange={onTypeChange}
                        checked={mapScheduleCreationTypeToOption(type)}
                    />
                </div>
                <div className={styles.checkbox}>
                    <Checkbox 
                        options={
                            [{
                                label: "Create Pool Matchups Only",
                                checked: isMatchupsOnly,
                                disabled: type !== ScheduleCreationType.Scheduler,
                            }]
                        }
                        onChange={onChangeMatchupsOnly}
                        
                    />
                </div>
                
            </div>
            
            <div className={styles.btnWrapper}>
                <Button
                    label="Next"
                    color="primary"
                    variant="contained"
                    onClick={() => {
                        setNextStep(2);
                    }}
                />
            </div>
        </div>
    )
};

export default CreateScheduleStepOne;