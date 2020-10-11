import React from 'react';

import { Input, Select, Checkbox, Tooltip } from 'components/common';
import { ISchedule, BindingCbWithOne, IBracket } from 'common/models';
import {
    getTimeFromString,
    getIcon,
  } from 'helpers';
import { Icons } from 'common/enums';
import { TooltipMessageTypes } from 'components/common/tooltip-message/types';

import styles from '../styles.module.scss';

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface ICreateBracketStepTwo {
    bracket?: IBracket | null;
    schedules: ISchedule[];
    alignItems: boolean;
    adjustTime: boolean;
    newBracketName: string;
    selectedSchedule: string;
    localWarmup: string | null | undefined;
    onSetBracketName: BindingCbWithOne<string>;
    onSetSelectedSchedule: BindingCbWithOne<string>;
    onSetAlignItems: () => void;
    onSetAdjustTime: () => void;
    changeSetTimeBtwnPeriods: BindingCbWithOne<string>;
};

const CreateBracketStepTwo = ({
    bracket,
    schedules,
    alignItems,
    adjustTime,
    localWarmup,
    newBracketName,
    selectedSchedule,
    onSetBracketName,
    onSetSelectedSchedule,
    onSetAlignItems,
    onSetAdjustTime,
    changeSetTimeBtwnPeriods,
  }: ICreateBracketStepTwo) => {

    const alignItemsTooltip = 'Early morning TP games will be moved adjacent to brackets';
    const adjustTimeTooltip = 'Provides a larger rest between games for advancing teams';
    const currentSheduleNameForBracket = schedules.filter((item: ISchedule) => item.schedule_id === bracket?.scheduleId);
    const schedulesOptions = bracket
                                ? [{
                                    label: currentSheduleNameForBracket[0].schedule_name!,
                                    value: currentSheduleNameForBracket[0].schedule_id,
                                  }]
                                : schedules.map(item => ({
                                    label: item.schedule_name!,
                                    value: item.schedule_id,
                                  }));
    const alignItemsOptions = [
        {
        label: 'Align Tourney Play games to the start of the Brackets',
        checked: alignItems,
        name: 'alignItems',
        },
    ];
    const adjustTimeOptions = [
        {
        label: 'Adjust time between games',
        checked: adjustTime,
        name: 'adjustTime',
        },
    ];
    
    const onChangeBracketName = (e: InputTargetValue) => onSetBracketName(e.target.value);

    const onChangeSelectedSchedule = (e: InputTargetValue) => onSetSelectedSchedule(e.target.value);

    const onChangeSetTimeBtwnPeriods = (e: InputTargetValue) => changeSetTimeBtwnPeriods(e.target.value);

    return (
        <div className={styles.mainBody}>
            <div className={styles.inputsWrapper}>
                <Input
                    width="230px"
                    onChange={onChangeBracketName}
                    value={newBracketName}
                    autofocus={true}
                    placeholder="Brackets Version Name"
                />
                <Select
                    name="Name"
                    width="230px"
                    placeholder={bracket ? currentSheduleNameForBracket[0].schedule_name : "Select Schedule"}
                    options={schedulesOptions}
                    value={selectedSchedule}
                    onChange={onChangeSelectedSchedule}
                    disabled={Boolean(bracket)}
                />
            </div>
            <div className={styles.checkboxWrapper}>
                <Checkbox options={alignItemsOptions} onChange={onSetAlignItems} />
                <Tooltip title={alignItemsTooltip} type={TooltipMessageTypes.INFO}>
                    <div className={styles.tooltipIcon}>{getIcon(Icons.INFO)}</div>
                </Tooltip>
            </div>
            <div>
                <div className={styles.checkboxWrapper}>
                    <Checkbox options={adjustTimeOptions} onChange={onSetAdjustTime} />
                    <Tooltip title={adjustTimeTooltip} type={TooltipMessageTypes.INFO}>
                        <div className={styles.tooltipIcon}>{getIcon(Icons.INFO)}</div>
                    </Tooltip>
                </div>
                <Input
                    onChange={onChangeSetTimeBtwnPeriods}
                    value={localWarmup ? getTimeFromString(localWarmup, 'minutes') : 0}
                    width="150px"
                    minWidth="50px"
                    type="number"
                    disabled={!(adjustTime && localWarmup)}
                    endAdornment="Minutes"
                />
            </div>
        </div>
    );
};

  export default CreateBracketStepTwo;