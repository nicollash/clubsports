import moment from "moment";
import { IEventDetails } from "common/models";

const timeToDate = (time: string) => {
  if (!time) {
    return new Date();
  }

  return moment(time.split(":").join(""), "HHmmss").format();
};

const dateToTime = (date: Date | string) => moment(date).format("HH:mm:ss");

const getTimeFromString = (
  time: string,
  type: "hours" | "minutes" | "seconds" | "hh" | "mm" | "ss"
): number => {
  if (!time) {
    return 0;
  }
  const divides = time.split(":").map((timeDiv: string) => Number(timeDiv));
  const [hours, minutes, seconds] = divides;

  switch (type) {
    case "hours":
      return hours;
    case "minutes":
      return hours * 60 + minutes;
    case "seconds":
      return hours * 3600 + minutes * 60 + seconds;
    case "hh":
      return hours;
    case "mm":
      return minutes;
    case "ss":
      return seconds;
    default:
      return -1;
  }
};

const timeToString = (time: number): string => {
  const hours = Math.floor(time / 60);
  const minutes = time - hours * 60;
  const seconds = time * 60 - hours * 3600 - minutes * 60;

  return [hours, minutes, seconds]
    .toString()
    .split(",")
    .map((el: string) => (el.length < 2 ? "0" + el : el))
    .join(":");
};

const compareTime = (a: string, b: string) => +new Date(b) - +new Date(a);

const dateToShortString = (
  date: string | Date | null | undefined,
  isUTC: boolean = false
): string => {
  if (!date) return "";
  if (!isUTC) {
    return moment.utc(date).format("YYYY-MM-DD");
  } else {
    return moment(date).format("YYYY-MM-DD");
  }
};

const calculateTournamentDays = (event: IEventDetails) => {
  if (
    event?.league_dates &&
    (event?.event_type === "League" || event?.discontinuous_dates_YN === 1)
  ) {
    return JSON.parse(event.league_dates).map((d: string) =>
      dateToShortString(d)
    );
  }

  const startDate = event?.event_startdate;
  const endDate = event?.event_enddate;

  const daysDiff = moment(endDate).diff(startDate, "day");

  const days = [dateToShortString(startDate)];

  [...Array(daysDiff)].map((_v, i) => {
    const tomorrowDate = moment.utc(startDate).add("days", i + 1);
    days.push(tomorrowDate.format("YYYY-MM-DD"));
  });

  return days;
};

const dateToMMMDD = (date: string | Date | null | undefined) => {
  if (!date) return "";
  return moment.utc(date).format("ll").slice(0, 6);
};

export {
  dateToMMMDD,
  timeToDate,
  dateToTime,
  getTimeFromString,
  timeToString,
  compareTime,
  calculateTournamentDays,
  dateToShortString,
};
