import { reactive } from "bonsify";
import { FamilyMember } from "./Family";
import { Todo } from "./Todo";
import { FamilyScrum } from "./FamilyScrum";
import {
  WeekTodoActivityDTO,
  WeekTodoDTO,
} from "../environments/Browser/Persistence";

export type WeekTodoAssignment = {
  familyMember: FamilyMember;
  activity: WeekTodoActivityDTO;
};

export type WeekTodo = {
  id: string;
  todo: Todo;
  assignments: WeekTodoAssignment[];
};

type Params = {
  todo: Todo;
  familyScrum: FamilyScrum;
  weekTodoData: WeekTodoDTO;
};

export function WeekTodo({
  todo,
  weekTodoData,
  familyScrum,
}: Params): WeekTodo {
  const weekTodo = reactive<WeekTodo>({
    id: todo.id,
    todo,
    assignments: deriveAssignments(),
  });

  return weekTodo;

  function deriveAssignments() {
    const assignments: WeekTodoAssignment[] = [];

    for (const userId in weekTodoData.activityByUserId) {
      const familyMember = familyScrum.session.family.members.find(
        (member) => member.id === userId
      );

      if (familyMember) {
        assignments.push({
          familyMember,
          activity: weekTodoData.activityByUserId[userId],
        });
      }
    }

    return assignments;
  }

  function toggleAssignment() {}
}
