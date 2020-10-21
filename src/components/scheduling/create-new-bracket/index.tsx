/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Modal, HeadingLevelFour, Button } from "components/common";
import styles from "./styles.module.scss";
import {
  ISchedule,
  IEventDetails,
  IField,
  IDivision,
  IBracket,
} from "common/models";
import {
  timeToString,
  getVarcharEight,
  getTimeValuesFromEventSchedule,
  calculateTimeSlots,
} from "helpers";
import { errorToast } from "components/common/toastr/showToasts";
import ITimeSlot from "common/models/schedule/timeSlots";
import { predictPlayoffTimeSlots } from "components/schedules/definePlayoffs";
import CreateBracketStepOne from "./create-bracket-step-one";
import CreateBracketStepTwo from "./create-bracket-step-two";

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

enum ModalPageEnum {
  chooseMode = 1,
  modalBody = 2,
}

enum ModeOptionEnum {
  "Use Scheduling Algorithm" = 0,
  "Create Custom Brackets" = 1,
}

export interface ICreateBracketModalOutput {
  id: string;
  name: string;
  scheduleId: string;
  alignItems: boolean;
  adjustTime: boolean;
  warmup: string;
  eventId: string;
  bracketDate: string;
  createDate: string;
  startTimeSlot: string;
  endTimeSlot: string;
  isManualCreation?: boolean;
  multiDay?: boolean;
  useFacilAbbr?: number;
  bracketLevel?: number;
  customPlayoff?: number;
}

interface IProps {
  fields: IField[];
  divisions: IDivision[];
  event?: IEventDetails;
  isOpen: boolean;
  schedules: ISchedule[];
  bracket?: IBracket | null;
  onClose: () => void;
  onCreateBracket: (scheduleData: ICreateBracketModalOutput) => void;
  selectedMode: string;
}

const getWarmupFromSchedule = (
  schedules: ISchedule[],
  selectedSchedule: string
) => {
  const time = schedules.find((item) => item.schedule_id === selectedSchedule)
    ?.pre_game_warmup;
  return time;
};

const CreateNewBracket = (props: IProps) => {
  const {
    isOpen,
    onClose,
    schedules,
    bracket,
    onCreateBracket,
    fields,
    divisions,
    event,
    selectedMode,
  } = props;
  const ModeOptions = ["Use Scheduling Algorithm", "Create Custom Brackets"];

  const [bracketName, setBracketName] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [alignItems, setAlignItems] = useState(false);
  const [adjustTime, setAdjustTime] = useState(false);
  const [modalPage, setModalPage] = useState(ModalPageEnum[selectedMode]);
  const [localWarmup, setLocalWarmup] = useState(
    getWarmupFromSchedule(schedules, selectedSchedule)
  );
  const [mode, setModeOptions] = useState(ModeOptionEnum["Use Scheduling Algorithm"]);
  const [selectedTimeSlotsNum] = useState("0");
  const [playoffTimeSlots, setPlayoffTimeSlots] = useState<
    ITimeSlot[] | undefined
  >();

  useEffect(() => {
    const data = getWarmupFromSchedule(schedules, selectedSchedule);
    setLocalWarmup(data);

    const schedule = schedules.find(
      (item) => item.schedule_id === selectedSchedule
    );

    if (!schedule || !event) return;

    const timeValues = getTimeValuesFromEventSchedule(event, schedule);
    const timeSlots: ITimeSlot[] = calculateTimeSlots(timeValues)!;

    const newPlayoffTimeSlots = predictPlayoffTimeSlots(
      fields,
      timeSlots,
      divisions,
      event!
    );

    setPlayoffTimeSlots(newPlayoffTimeSlots);
  }, [selectedSchedule]);

  const onChangeTimeBtwnPeriods = (e: string) => {
    const timeInMinutes = Number(e);
    const timeInString = timeToString(timeInMinutes);
    setLocalWarmup(timeInString);
  };

  const onClosePressed = () => {
    setModalPage(ModalPageEnum[selectedMode]);
    setModeOptions(ModeOptionEnum["Use Scheduling Algorithm"]);
    setBracketName("");
    setSelectedSchedule("");
    setAlignItems(false);
    setAdjustTime(false);
    setLocalWarmup("00:00:00");
    onClose();
  };

  const onNextPressed = () => {
    setModalPage(ModalPageEnum.modalBody);
  };

  const onCreatePressed = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!event) {
      return errorToast(
        "Couldn't process the Bracket data. Please, try again."
      );
    }

    const eventId = event.event_id;
    const bracketDate = event.event_enddate;

    const firstTimeSlot = playoffTimeSlots?.length
      ? playoffTimeSlots[0].id
      : -1;
    const lastTimeSlot = playoffTimeSlots?.length
      ? playoffTimeSlots[playoffTimeSlots.length - 1].id
      : -1;

    const scheduleData: ICreateBracketModalOutput = {
      id: getVarcharEight(),
      name: bracketName,
      scheduleId: selectedSchedule,
      alignItems,
      adjustTime,
      bracketDate,
      eventId,
      startTimeSlot: String(firstTimeSlot),
      endTimeSlot: String(
        lastTimeSlot ? lastTimeSlot + +selectedTimeSlotsNum : lastTimeSlot
      ),
      warmup: localWarmup || "00:00:00",
      createDate: new Date().toISOString(),
      isManualCreation: mode === ModeOptionEnum["Create Custom Brackets"],
      multiDay:
        event?.multiday_playoffs_YN === 1 &&
        mode === ModeOptionEnum["Create Custom Brackets"],
      bracketLevel: Number(event?.bracket_level) || 1,
      customPlayoff: event.custom_playoffs_YN ? 1 : 0,
      useFacilAbbr: 1,
    };
    onCreateBracket(scheduleData);
  };

  const onModeChange = (e: InputTargetValue) => {
    setModeOptions(ModeOptions.findIndex((v) => v === e.target.value));
  };

  const onSetBracketName = (e: string) => {
    setBracketName(e);
    if (bracket) {
      setSelectedSchedule(bracket.scheduleId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClosePressed}>
      <div className={styles.wrapper}>
        <HeadingLevelFour>
          <span>Create Bracket</span>
        </HeadingLevelFour>
        {modalPage === ModalPageEnum.chooseMode ? (
          <CreateBracketStepOne
            modeOptions={ModeOptions}
            modeChange={onModeChange}
            mode={mode}
          />
        ) : (
          <CreateBracketStepTwo
            bracket={bracket}
            schedules={schedules}
            alignItems={alignItems}
            adjustTime={adjustTime}
            newBracketName={bracketName}
            selectedSchedule={selectedSchedule}
            localWarmup={localWarmup}
            onSetBracketName={(e: string) => onSetBracketName(e)}
            onSetSelectedSchedule={(e: string) => setSelectedSchedule(e)}
            onSetAlignItems={() => setAlignItems((v) => !v)}
            onSetAdjustTime={() => setAdjustTime((v) => !v)}
            changeSetTimeBtwnPeriods={(e: string) => onChangeTimeBtwnPeriods(e)}
          />
        )}
        <div className={styles.buttonsWrapper}>
          <Button
            label="Cancel"
            color="secondary"
            variant="text"
            onClick={onClosePressed}
          />
          {modalPage === ModalPageEnum.chooseMode ? (
            <Button
              label="Next"
              color="primary"
              variant="contained"
              onClick={onNextPressed}
            />
          ) : (
            <Button
              label="Create"
              color="primary"
              variant="contained"
              disabled={!bracketName || !selectedSchedule}
              onClick={onCreatePressed}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CreateNewBracket;
