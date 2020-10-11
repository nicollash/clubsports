import { EventStatuses, ScheduleStatuses } from 'common/enums';

export const getTournamentStatusColor = (status: number | string) => {
  switch (status) {
    case EventStatuses.Draft:
    case ScheduleStatuses.Draft:
      return { backgroundColor: '#ffcb00' };
    case EventStatuses.Published:
    case ScheduleStatuses.Published:
      return { backgroundColor: '#00cc47' };
    default:
      return null;
  }
};
