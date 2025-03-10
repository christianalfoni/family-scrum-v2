import { reactive } from "bonsify";
import { Dinner } from "./Dinner";

export type WeekDinner = {
  id: string;
  dinner: Dinner;
  weekDay: number;
};

type Params = {
  dinner: Dinner;
  weekDayIndex: number;
};

export function WeekDinner({ dinner, weekDayIndex }: Params) {
  const weekDinner = reactive<WeekDinner>({
    id: dinner.id,
    dinner,
    weekDay: weekDayIndex,
  });

  return weekDinner;
}
