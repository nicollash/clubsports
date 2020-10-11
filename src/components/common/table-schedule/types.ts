import { IMultiSelectOption } from "../multi-select";

export enum DayTypes {
  "Day 1" = 1,
  "Day 2" = 2,
  "Day 3" = 3,
}

export enum OptimizeTypes {
  MIN_RANK = "Min Rank Difference",
  MAX_RANK = "Max Rank Difference",
}

export interface IScheduleFilter {
  selectedDay?: string;
  divisionsOptions: IMultiSelectOption[];
  poolsOptions: IMultiSelectOption[];
  teamsOptions: IMultiSelectOption[];
  fieldsOptions: IMultiSelectOption[];
  timeOptions: IMultiSelectOption[];
}
