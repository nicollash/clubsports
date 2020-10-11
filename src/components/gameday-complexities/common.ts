import ITimeSlot from 'common/models/schedule/timeSlots';

export enum OptionsEnum {
  'Cancel Games' = 'cancel_games',
  'Weather Interruption: Modify Game Timeslots' = 'modify_game_timeslots',
}

export enum TypeOptionsEnum {
  'cancel_games' = 'Cancel Games',
  'modify_game_timeslots' = 'Weather Interruption: Modify Game Timeslots',
}
export interface IComplexityTimeslot {
  eventId: string;
  eventDays: string[];
  eventTimeSlots: ITimeSlot[];
  isLoading: boolean;
  isLoaded: boolean;
}

export interface IChangedTimeSlot {
  timeSlotTime: string;
  newTimeSlotTime: string;
}

export type IComplexityTimeslots = {
  [key: string]: IComplexityTimeslot;
};
