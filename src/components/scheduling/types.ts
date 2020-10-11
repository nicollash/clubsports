import { ISchedule } from 'common/models';

export interface ISchedulingSchedule extends ISchedule {
  createdByName: string | null;
  updatedByName: string | null;
}

enum ArchitectFormFields {
  MIN_NUM_GAMES = 'min_num_games',
  MAX_NUM_GAMES = 'max_num_games',
  GAMES_START_ON = 'games_start_on',
  PRE_GAME_WARMUP = 'pre_game_warmup',
  PERIOD_DURATION = 'period_duration',
  TIME_BTWN_PERIODS = 'time_btwn_periods',
  SCHEDULE_NAME = 'schedule_name',
  SCHEDULT_TAG = 'schedule_tag',
}

const gameStartOnOptions = ['5', '10', '15'];

export { ArchitectFormFields, gameStartOnOptions };
