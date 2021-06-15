import {
  setDay,
  format,
  subDays,
  addDays,
  getDay,
  parse,
  differenceInDays,
} from "date-fns";

export const getFirstDateOfPreviousWeek = () =>
  setDay(subDays(new Date(), 7), 1, { weekStartsOn: 1 });

export const getFirstDateOfCurrentWeek = () =>
  setDay(new Date(), 1, { weekStartsOn: 1 });

export const getFirstDateOfNextWeek = () =>
  setDay(addDays(new Date(), 7), 1, { weekStartsOn: 1 });

export const getPreviousWeekId = () => {
  return format(getFirstDateOfPreviousWeek(), "yyyyMMdd");
};

export const getCurrentWeekId = () => {
  return format(getFirstDateOfCurrentWeek(), "yyyyMMdd");
};

export const getNextWeekId = () => {
  return format(getFirstDateOfNextWeek(), "yyyyMMdd");
};

export const getFirstDayOfPreviousWeek = () => {
  return format(getFirstDateOfPreviousWeek(), "yyyyMMdd");
};

export const getDaysOfPreviousWeek = () => {
  return new Array(7)
    .fill(0)
    .map((_, index) =>
      format(addDays(getFirstDateOfPreviousWeek(), index), "yyyyMMdd")
    );
};

export const getDaysOfCurrentWeek = () => {
  return new Array(7)
    .fill(0)
    .map((_, index) =>
      format(addDays(getFirstDateOfCurrentWeek(), index), "yyyyMMdd")
    );
};

export const getDaysOfNextWeek = () => {
  return new Array(7)
    .fill(0)
    .map((_, index) =>
      format(addDays(getFirstDateOfNextWeek(), index), "yyyyMMdd")
    );
};

export const isWithinWeek = (dateA: Date | number, dateB: Date | number) => {
  const diff = differenceInDays(dateA, dateB) - 7;

  return diff >= 0 && diff < 7;
};
export const getDateFromWeekId = (weekId: string) => {
  const year = Number(weekId.substr(0, 4));
  const month = Number(weekId.substr(4, 2));
  const day = Number(weekId.substr(6, 2));

  return new Date(year, month - 1, day);
};

export const stringToColor = (str: string) => {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = "#";
  for (let i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
};

export const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// To support negative numbers
export const mod = (n: number, m: number) => {
  return ((n % m) + m) % m;
};

export const getCurrentDayIndex = () => {
  return mod(new Date().getDay() - 1, 7);
};

export const getWeekdayIndexes = (dates: string[], weekDates: string[]) => {
  return dates
    .filter((date) => weekDates.includes(date))
    .map((date) => getDay(parse(date, "yyyyMMdd", new Date())));
};
