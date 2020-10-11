import { getTimeFromString, timeToString } from 'helpers';
import {
  IEventDetails,
  IConfigurableSchedule,
  ISchedule,
  ISchedulesGame,
  ISchedulesDetails,
} from 'common/models';
import moment from 'moment';
import { orderBy } from 'lodash-es';
import { TimeSlotsEntityTypes } from 'common/enums';

export interface ITimeValues {
  firstGameTime: string;
  lastGameEnd: string;
  preGameWarmup: string | null;
  periodDuration: string;
  timeBtwnPeriods: string;
  periodsPerGame: number;
  gamesStartOn: string;
}

const setGameOptions = (schedule: IConfigurableSchedule) => {
  const {
    min_num_games,
    max_num_games,
    pre_game_warmup,
    period_duration,
    time_btwn_periods,
    periods_per_game,
  } = schedule;

  return {
    minGameNum: Number(min_num_games) || undefined,
    maxGameNum: Number(max_num_games) || undefined,
    totalGameTime: calculateTotalGameTime(
      pre_game_warmup,
      period_duration,
      time_btwn_periods,
      periods_per_game
    ),
  };
};

const calculateTotalGameTime = (
  preGameWarmup: string | null,
  periodDuration: string,
  timeBtwnPeriods: string,
  periodsPerGame: number
) => {
  const preGameWarmupMin = getTimeFromString(preGameWarmup!, 'minutes');
  const periodDurationMin = getTimeFromString(periodDuration, 'minutes');
  const timeBtwnPeriodsMin = getTimeFromString(timeBtwnPeriods, 'minutes');
  return (
    preGameWarmupMin + periodDurationMin * periodsPerGame + timeBtwnPeriodsMin
  );
};

const getTimeValuesFromEventSchedule = (
  event: IEventDetails,
  schedule: ISchedule
) => ({
  firstGameTime: event.first_game_time,
  lastGameEnd: event.last_game_end,
  preGameWarmup: schedule.pre_game_warmup,
  periodDuration: schedule.period_duration,
  timeBtwnPeriods: schedule.time_btwn_periods,
  periodsPerGame: event.periods_per_game,
  gamesStartOn: schedule.games_start_on,
});

const getTimeValuesFromSchedule = (
  schedule: IConfigurableSchedule
): ITimeValues => ({
  firstGameTime: schedule.first_game_time || '',
  lastGameEnd: schedule.last_game_end_time || '',
  preGameWarmup: schedule.pre_game_warmup,
  periodDuration: schedule.period_duration,
  timeBtwnPeriods: schedule.time_btwn_periods,
  periodsPerGame: schedule.periods_per_game,
  gamesStartOn: schedule.games_start_on,
});

export const getTimeSlotsFromEntities = (
  timeSlotsEntities: ISchedulesDetails[] | ISchedulesGame[],
  timeSlotsEntity: TimeSlotsEntityTypes
) => {
  let timeValues = [];

  switch (timeSlotsEntity) {
    case TimeSlotsEntityTypes.SCHEDULE_DETAILS: {
      timeValues = (timeSlotsEntities as ISchedulesDetails[]).reduce(
        (acc, scheduleDetails) => {
          const { game_time } = scheduleDetails;

          return game_time ? [...acc, game_time] : acc;
        },
        [] as string[]
      );

      break;
    }
    case TimeSlotsEntityTypes.SCHEDULE_GAMES: {
      timeValues = (timeSlotsEntities as ISchedulesGame[]).reduce(
        (acc, scheduleGame) => {
          const { game_time } = scheduleGame;

          return game_time ? [...acc, game_time] : acc;
        },
        [] as string[]
      );
      break;
    }
  }

  const uniqueTimeValues = Array.from(new Set(timeValues));

  const sortedTimeValues = orderBy(uniqueTimeValues);

  const mappedTimeSlots = sortedTimeValues.map((it, idx) => ({
    id: idx,
    time: it,
  }));

  return mappedTimeSlots;
};

// This is the function that calculates the time slots for all screens... Very important function.
const calculateTimeSlots = (
  timeValues: ITimeValues,
  timeSlotsEntities?: ISchedulesGame[] | ISchedulesDetails[],
  entityType?: TimeSlotsEntityTypes
) => {
  if (!timeValues) return;

  if (timeSlotsEntities && entityType && timeSlotsEntities?.length !== 0) {
    const timeSlots = getTimeSlotsFromEntities(timeSlotsEntities, entityType);

    return timeSlots;
  }

  const {
    firstGameTime,
    lastGameEnd,
    preGameWarmup,
    periodDuration,
    timeBtwnPeriods,
    periodsPerGame,
    gamesStartOn,
  } = timeValues;

  const firstGameTimeMin = getTimeFromString(firstGameTime, 'minutes');
  const lastGameEndMin = getTimeFromString(lastGameEnd, 'minutes');
  const totalGameTime = calculateTotalGameTime(
    preGameWarmup,
    periodDuration,
    timeBtwnPeriods,
    periodsPerGame
  );

  const gamesStartOnNum = Number(gamesStartOn);
  const timeSlots = [];

  const timeSlotsNum = Math.floor(
    (lastGameEndMin - firstGameTimeMin) / totalGameTime
  );

  for (let i = 0; i < timeSlotsNum; i++) {
    const timeInMin =
      i === 0
        ? firstGameTimeMin
        : getTimeFromString(timeSlots[timeSlots.length - 1].time, 'minutes') +
          totalGameTime;

    const validMinutes =
      gamesStartOnNum * Math.ceil(timeInMin / gamesStartOnNum);
    const timeInStringFormat = timeToString(validMinutes);

    if (validMinutes + totalGameTime > lastGameEndMin) {
      break;
    }

    timeSlots.push({
      id: i,
      time: timeInStringFormat,
    });
  }

  return timeSlots;
};

const formatTimeSlot = (time: string) => {
  if (!time || typeof time !== 'string') return;
  const timeValue = time.slice(0, 5);
  return moment(timeValue, ['HH:mm']).format('hh:mm A');
};

export {
  setGameOptions,
  calculateTotalGameTime,
  getTimeValuesFromEventSchedule,
  getTimeValuesFromSchedule,
  calculateTimeSlots,
  formatTimeSlot,
};
