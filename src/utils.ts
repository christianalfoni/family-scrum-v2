import { setDay, format, subDays, addDays, getDay, parse } from "date-fns";
import { GroceryCategory } from "./environment/storage";

const getFirstDateOfPreviousWeek = () =>
  setDay(subDays(new Date(), 7), 1, { weekStartsOn: 1 });

const getFirstDateOfCurrentWeek = () =>
  setDay(new Date(), 1, { weekStartsOn: 1 });

const getFirstDateOfNextWeek = () =>
  setDay(addDays(new Date(), 7), 1, { weekStartsOn: 1 });

export const getCurrentWeekDayId = (weekDay: number) => {
  return format(setDay(new Date(), weekDay), "yyyyMMdd");
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

export const getWeekDayIndexes = (dates: string[], weekDates: string[]) => {
  return dates
    .filter((date) => weekDates.includes(date))
    .map((date) => getDay(parse(date, "yyyyMMdd", new Date())));
};

export const groceryCategoryToBackgroundColor = (
  groceryCategory: GroceryCategory
) => {
  switch (groceryCategory) {
    case GroceryCategory.DryGoods:
      return "bg-yellow-500";
    case GroceryCategory.Frozen:
      return "bg-blue-500";
    case GroceryCategory.FruitVegetables:
      return "bg-green-500";
    case GroceryCategory.MeatDairy:
      return "bg-red-500";
    case GroceryCategory.Other:
      return "bg-gray-500";
  }
};
