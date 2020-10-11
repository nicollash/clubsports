import React, { useEffect, useState, useCallback } from "react";
import { ISchedulesDetails, ISelectOption } from "common/models";
import ITimeSlot from "common/models/schedule/timeSlots";
import { TimeSlotsEntityTypes } from "common/enums";
import {
  getTimeSlotsFromEntities,
  ITimeValues,
} from "helpers/schedule.helpers";
import { timeToDate, dateToTime, dateToShortString } from "helpers/date.helper";
import {
  Select,
  DatePicker,
  PopupConfirm,
  Button,
  Checkbox,
} from "components/common";
import styles from "./styles.module.scss";
import moment from "moment";

interface IProps {
  schedulesDetails: ISchedulesDetails[];
  timeValues: ITimeValues;
  onScheduleGameUpdate: (gameId: number, gameTime: string) => void;
  updateSchedulesDetails: (
    modifiedSchedulesDetails: ISchedulesDetails[],
    schedulesDetailsToModify: ISchedulesDetails[]
  ) => void;
}

const UpdateTimeSlots = ({
  schedulesDetails,
  timeValues,
  onScheduleGameUpdate,
  updateSchedulesDetails,
}: IProps) => {
  const [schedulesDetailsToState, setSchedulesDetailsToState] = useState<
    ISchedulesDetails[]
  >(schedulesDetails);
  const [selectedDateId, setSelectedDateId] = useState(0);
  const [selectedDateTimeSlots, setSelectedDateTimeSlots] = useState<
    ITimeSlot[]
  >([]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState(0);
  const [timeShift, setTimeShift] = useState<number>(0);
  const [newTimeSlot, setNewTimeSlot] = useState<Date>();
  const [isOpenWarning, setIsOpenWarning] = useState<boolean>(false);
  const [isOpenConfirmation, setIsOpenConfirmation] = useState<boolean>(false);
  const [doShiftAllSubsequentGames, setDoShiftAllSubsequentGames] = useState<
    boolean
  >(false);
  const [messageForWarning, setMessageForWarning] = useState(
    "The new time can't be earlier than the selected timeslot."
  );

  const dates: string[] = [
    ...new Set(
      schedulesDetails
        .filter((v) => v.game_date !== null)
        .map((v) => v.game_date as string)
        .sort((a, b) => a.localeCompare(b))
    ),
  ];

  const getDateByTimeslotId = useCallback(
    (timeslotId: number): Date =>
      getDateFromTimeSlotsById(selectedDateTimeSlots, timeslotId),
    // eslint-disable-next-line
    []
  );

  const getTimeSlots = useCallback(
    (selectedDateIndex: number): ITimeSlot[] => {
      return getTimeSlotsFromEntities(
        filterScheduleDetailsByDate(selectedDateIndex),
        TimeSlotsEntityTypes.SCHEDULE_DETAILS
      );
    },
    // eslint-disable-next-line
    []
  );

  useEffect(() => {
    setSelectedDateTimeSlots(getTimeSlots(selectedDateId));
  }, [getTimeSlots, schedulesDetailsToState, selectedDateId]);

  useEffect(() => {
    if (!newTimeSlot && selectedDateTimeSlots && selectedDateTimeSlots.length) {
      setNewTimeSlot(getDateByTimeslotId(selectedTimeSlotId));
    }
  }, [
    getDateByTimeslotId,
    newTimeSlot,
    selectedDateTimeSlots,
    selectedTimeSlotId,
  ]);

  const filterScheduleDetailsByDate = (dateId: number): ISchedulesDetails[] => {
    return schedulesDetailsToState.filter(
      (v) => dateToShortString(v.game_date) === dateToShortString(dates[dateId])
    );
  };

  const formatTime = (time: string): string =>
    moment(timeToDate(time)).locale("en").format("hh:mm A");

  const mapDatesToOptions = (): ISelectOption[] => {
    return dates.map((v, i) => ({
      value: i,
      label: moment.utc(v).format("ddd MMM D"),
    })) as ISelectOption[];
  };

  const mapTimeSlotsToOptions = () => {
    return selectedDateTimeSlots.map((v) => ({
      value: v.id,
      label: formatTime(v.time),
    }));
  };

  const onDateChange = (e: any): void => {
    const selectedDateFromSelect: number = e.target.value;
    setSelectedDateId(selectedDateFromSelect);
    const timeSlots = getTimeSlots(selectedDateFromSelect);
    setSelectedDateTimeSlots(timeSlots);
    setSelectedTimeSlotId(0);
    setNewTimeSlot(getDateFromTimeSlotsById(timeSlots, 0));
  };

  const onTimeSlotChange = (e: any): void => {
    const selectedTimeslotId: number = e.target.value;
    setSelectedTimeSlotId(selectedTimeslotId);
    setNewTimeSlot(getDateByTimeslotId(selectedTimeslotId));
  };

  const getDateFromTimeSlotsById = (
    timeSlots: ITimeSlot[],
    timeslotId: number
  ): Date => {
    const dayDate = dateToShortString(dates[selectedDateId]);
    const timeslot = timeSlots.find((v: ITimeSlot) => v.id === timeslotId);
    if (timeslot) {
      return new Date(dayDate + " " + timeslot.time);
    }
    const current = new Date();
    return new Date(dayDate + " " + current.toLocaleTimeString("en-US"));
  };

  const showWarningMessage = (message: string): void => {
    setMessageForWarning(message);
    setIsOpenWarning(true);
  };

  const onTimeChange = (newTime: Date): void => {
    const dayDate = dateToShortString(dates[selectedDateId]);
    const time = new Date(dayDate + " " + newTime.toLocaleTimeString("en-US"));
    const minutes = time.getMinutes();
    const remainder = minutes % 5;
    time.setMinutes(
      remainder >= 3 ? minutes + (5 - remainder) : minutes - remainder
    );
    const currentTimeSlot = selectedDateTimeSlots.find(
      (v) => v.id === selectedTimeSlotId
    );
    const currentTimeSlotValue = new Date(
      time.toDateString() + " " + currentTimeSlot!.time
    );
    const timeDifference = +time - +currentTimeSlotValue;

    setTimeShift(timeDifference);
    setNewTimeSlot(time);
  };

  const validateTime = (time: Date | undefined): string => {
    if (!time) {
      return "There is no new selected time slot";
    }

    const prevTimeslot = selectedDateTimeSlots.find(
      (v) => v.id === selectedTimeSlotId - 1
    );
    const nextTimeslot = selectedDateTimeSlots.find(
      (v) => v.id === selectedTimeSlotId + 1
    );

    let prevTimeSlotValue;
    let nextTimeSlotValue;
    let prevTime: string;
    let nextTime: string;
    if (prevTimeslot) {
      prevTimeSlotValue = Date.parse(
        time.toDateString() + " " + prevTimeslot.time
      );
    }
    if (nextTimeslot) {
      nextTimeSlotValue = Date.parse(
        time.toDateString() + " " + nextTimeslot.time
      );
    }

    if (doShiftAllSubsequentGames) {
      if (timeShift < 0) {
        return "The new time can't be earlier than the selected timeslot for shifting subsequent games.";
      }
    } else {
      if (!prevTimeslot && nextTimeSlotValue && +time >= nextTimeSlotValue) {
        nextTime = formatTime(nextTimeslot!.time);
        return `Time should be less than ${nextTime}`;
      }
      if (!nextTimeslot && prevTimeSlotValue && +time <= prevTimeSlotValue) {
        prevTime = formatTime(prevTimeslot!.time);
        return `Time should be more than ${prevTime}`;
      }

      if (
        nextTimeSlotValue &&
        prevTimeSlotValue &&
        (+time <= prevTimeSlotValue || +time >= nextTimeSlotValue)
      ) {
        nextTime = formatTime(nextTimeslot!.time);
        prevTime = formatTime(prevTimeslot!.time);
        return `Time should be between ${prevTime} and ${nextTime}`;
      }
    }

    return "";
  };

  const validateForOutsideEventTimeWindow = (): boolean => {
    const dayDate = dateToShortString(dates[selectedDateId]);
    const firstGameTime = new Date(dayDate + " " + timeValues.firstGameTime);
    const lastGameEnd = new Date(dayDate + " " + timeValues.lastGameEnd);

    if (doShiftAllSubsequentGames) {
      const lastGameTimeSlot = Date.parse(
        dayDate +
          " " +
          selectedDateTimeSlots[selectedDateTimeSlots.length - 1].time
      );
      const lastGamePossibleTimeSlot = new Date(
        lastGameTimeSlot.valueOf() + timeShift
      );

      if (lastGameEnd > lastGamePossibleTimeSlot) {
        return false;
      }
    } else {
      if (firstGameTime <= newTimeSlot! && newTimeSlot! <= lastGameEnd) {
        return false;
      }
    }

    return true;
  };

  const validateBeforeSave = () => {
    const message = validateTime(newTimeSlot);
    const isOutsideEventTimeWindow: boolean = validateForOutsideEventTimeWindow();

    if (doShiftAllSubsequentGames) {
      if (isOutsideEventTimeWindow) {
        openConfirmationPopup();
        return;
      } else {
        if (message) {
          showWarningMessage(message);
          return;
        }
      }
    } else {
      if (message) {
        showWarningMessage(message);
        return;
      } else {
        if (isOutsideEventTimeWindow) {
          openConfirmationPopup();
          return;
        }
      }
    }

    updateTimeSlots();
  };

  const updateTimeSlots = () => {
    let changingTimeSlots: string[] = [];
    if (doShiftAllSubsequentGames) {
      changingTimeSlots = selectedDateTimeSlots
        .slice(selectedTimeSlotId)
        .map((timeslot) => timeslot.time);
    } else {
      changingTimeSlots = [selectedDateTimeSlots[selectedTimeSlotId].time];
    }

    const filteredSchedulesDetailsByDate = filterScheduleDetailsByDate(
      selectedDateId
    );

    const swapMap = changingTimeSlots.map((slot) => {
      return {
        prevTimeSlot: slot,
        nextTimeSlot: dateToTime(
          new Date(+new Date(timeToDate(slot)) + timeShift)
        ),
      };
    });

    const schedulesDetailsToSave: ISchedulesDetails[] = [];
    filteredSchedulesDetailsByDate.forEach((detail) => {
      const newDetail = { ...detail };
      if (
        newDetail.game_time &&
        changingTimeSlots.includes(newDetail.game_time)
      ) {
        const time = swapMap.find(
          (v) => v.prevTimeSlot === newDetail.game_time
        );
        newDetail.game_time = convertCorrectFormatTime(
          time ? time.nextTimeSlot : newDetail.game_time
        );
        onScheduleGameUpdate(+newDetail.game_id, newDetail.game_time);
        schedulesDetailsToSave.push(newDetail);
      }
    });

    const detailsToState = schedulesDetails.map((detail) => {
      const itemForChange = schedulesDetailsToSave.find(
        (o) => o.game_id === detail.game_id
      );
      return itemForChange ? itemForChange : detail;
    });

    setSchedulesDetailsToState(detailsToState);
    updateSchedulesDetails(detailsToState, schedulesDetailsToSave);
  };

  const closeWarning = () => setIsOpenWarning(false);
  const closeConfirmation = () => setIsOpenConfirmation(false);

  const openConfirmationPopup = () => setIsOpenConfirmation(true);
  const onPopupConfirm = () => {
    updateTimeSlots();
    closeConfirmation();
  };

  const onShiftOptionChange = () => {
    setDoShiftAllSubsequentGames(!doShiftAllSubsequentGames);
  };

  const convertCorrectFormatTime = (gameTime: string) => {
    const timeArr = gameTime.split(":");
    return `${timeArr[0]}:${timeArr[1]}:00`;
  };

  return (
    <div>
      <div className={styles.selectContainer}>
        <div className={styles.selectWrapper}>
          <Select
            options={mapDatesToOptions()}
            placeholder="Select Date"
            value={selectedDateId?.toString() || ""}
            onChange={onDateChange}
          />
        </div>
        <div className={styles.selectWrapper}>
          <Select
            placeholder="Select Timeslot"
            options={mapTimeSlotsToOptions()}
            value={selectedTimeSlotId?.toString() || ""}
            onChange={onTimeSlotChange}
          />
        </div>
      </div>
      <div className={styles.flexCol}>
        <div className={styles.flexcontainer}>
          <p>New Timeslot Start:</p>
          <DatePicker
            value={newTimeSlot}
            type="time"
            viewType="input"
            onChange={onTimeChange}
          />
          <div className={styles.btnsWrapper}>
            <Button
              label="Commit Change"
              variant="contained"
              color="primary"
              onClick={validateBeforeSave}
              disabled={!newTimeSlot}
            />
          </div>
        </div>

        <Checkbox
          options={[
            {
              label: "Shift all subsequent games",
              checked: doShiftAllSubsequentGames,
            },
          ]}
          onChange={onShiftOptionChange}
        />
      </div>

      <PopupConfirm
        isOpen={isOpenWarning}
        message={messageForWarning}
        onClose={closeWarning}
        onCanceClick={closeWarning}
        showYes={false}
        onYesClick={closeWarning}
      />

      <PopupConfirm
        isOpen={isOpenConfirmation}
        message="Game time is outside of the event's time window. Are you sure?"
        onClose={closeConfirmation}
        onCanceClick={closeConfirmation}
        onYesClick={onPopupConfirm}
        showYes={true}
        showNo={true}
      />
    </div>
  );
};

export default UpdateTimeSlots;
