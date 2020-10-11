import React, { useState, useRef } from 'react';
import {
  Modal,
  HeadingLevelFour
} from 'components/common';
import styles from './styles.module.scss';
import {
  IConfigurableSchedule,
  ScheduleCreationType,
} from 'common/models/schedule';
import CreateScheduleStepOne from './create-schedule-step-one/index';
import CreateScheduleStepTwo from './create-schedule-step-two/index';
import useOnclickOutside from 'react-cool-onclickoutside';

interface IProps {
  schedule: IConfigurableSchedule;
  isOpen: boolean;
  onChange: (name: string, value: any) => void;
  onCreate: (schedule: IConfigurableSchedule) => void;
  onClose: () => void;
}

const CreateNewModal = (props: IProps) => {
  const { schedule, isOpen, onCreate, onClose, onChange } = props;

  const [step, setStep] = useState(1);
  const [type, setType] = useState(ScheduleCreationType.Scheduler);
  const [isMatchupsOnly, setIsMatchipsOnly] = useState<boolean>(false);

  const localClose = () => {
    onChange('schedule_name', '');
    onClose();
  };

  const onCancelClick = () => {
    localClose();
    setStep(1);
    setType(ScheduleCreationType.Scheduler);
  };

  const ref = useRef<HTMLDivElement>(null);
  useOnclickOutside(ref, () => {
    localClose();
    setStep(1);
    setType(ScheduleCreationType.Scheduler);
  });

  const setCreationType = (t: ScheduleCreationType) => {
    onChange('create_mode', ScheduleCreationType[t]);
  };

  const chooseOnCreateFunction = () => {
    const currentType = isMatchupsOnly ? ScheduleCreationType.Visual : type;
    setCreationType(currentType);
    onChange('is_matchup_only_YN', isMatchupsOnly ? 1 : 0);
    onCreate(schedule);
  };

  const onChangeMatchupsOnly = () => setIsMatchipsOnly(!isMatchupsOnly);

  const renderModal = () => {
    switch (step) {
      case 1:
        return (
          <CreateScheduleStepOne
            isMatchupsOnly={isMatchupsOnly}
            onChangeMatchupsOnly={onChangeMatchupsOnly}
            setSelectedType={(t: ScheduleCreationType) => setType(t)}
            setNextStep={(s: number) => setStep(s)}
          />
        );
      case 2:
        return (
          <CreateScheduleStepTwo
            schedule={schedule}
            onChange={onChange}
            onCancelClick={onCancelClick}
            chooseOnCreateFunction={chooseOnCreateFunction}
          />
        );
      default:
        return (
          <CreateScheduleStepOne
            isMatchupsOnly={isMatchupsOnly}
            onChangeMatchupsOnly={onChangeMatchupsOnly}
            setSelectedType={(t: ScheduleCreationType) => setType(t)}
            setNextStep={(s: number) => setStep(s)}
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={localClose}>
      <div className={styles.wrapper} ref={ref}>
        <HeadingLevelFour>
          <span>Create Schedule</span>
        </HeadingLevelFour>
        {renderModal()}
      </div>
    </Modal>
  );
};

export default CreateNewModal;
