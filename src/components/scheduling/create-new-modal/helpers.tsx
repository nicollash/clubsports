import { ScheduleCreationType } from 'common/models';

const getScheduleCreationTypeOptions = () =>
  Object.keys(ScheduleCreationType)
    .map((k: string) => mapScheduleCreationTypeToOption(ScheduleCreationType[k]))
    .filter(o => o);

const mapScheduleCreationTypeToOption = (t: ScheduleCreationType) => {
  switch (t) {
    case ScheduleCreationType.Manual:
      return 'Create Manually';
    case ScheduleCreationType.Visual:
      return 'Use Visual Games Maker';
    case ScheduleCreationType.Scheduler:
      return 'Use Scheduler';
    default:
      return '';
  }
};

const mapScheduleCreationOptionToType = (o: string): ScheduleCreationType => {
  switch (o) {
    case 'Create Manually':
      return ScheduleCreationType.Manual;
    case 'Use Visual Games Maker':
      return ScheduleCreationType.Visual;
    case 'Use Scheduler':
    default:
      return ScheduleCreationType.Scheduler;
  }
};

export {
  getScheduleCreationTypeOptions,
  mapScheduleCreationTypeToOption,
  mapScheduleCreationOptionToType,
  ScheduleCreationType,
};
