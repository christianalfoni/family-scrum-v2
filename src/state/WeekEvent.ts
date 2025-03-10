import { reactive } from "bonsify";
import { Todo } from "./Todo";
import { Timestamp } from "firebase/firestore";

type TodoWithDate = Omit<Todo, "date"> & {
  date: Timestamp;
};

export type WeekEvent = {
  id: string;
  todo: TodoWithDate;
  weekDay: number;
};

type Params = {
  todo: TodoWithDate;
  weekDayIndex: number;
};

export function WeekEvent({ todo, weekDayIndex }: Params) {
  const weekEvent = reactive<WeekEvent>({
    id: todo.id,
    todo,
    weekDay: weekDayIndex,
  });

  return weekEvent;
}
