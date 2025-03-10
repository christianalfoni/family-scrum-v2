import { reactive } from "bonsify";
import { FamilyMember } from "./Family";
import { Todo } from "./Todo";
import { FamilyScrum } from "./FamilyScrum";

export type WeekTodo = {
  id: string;
  todo: Todo;
  weekDay: number;
  assignments: FamilyMember[];
};

type Params = {
  todo: Todo;
  weekDayIndex: number;
  familyScrum: FamilyScrum;
  assignments: string[];
};

export function WeekTodo({
  todo,
  weekDayIndex,
  familyScrum,
  assignments,
}: Params): WeekTodo {
  const weekTodo = reactive<WeekTodo>({
    id: todo.id,
    todo,
    weekDay: weekDayIndex,
    assignments: assignments.map(
      (userId) => familyScrum.session.family.membersById[userId]
    ),
  });

  return weekTodo;
}
