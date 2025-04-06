import { reactive } from "mobx-lite";
import {
  FamilyPersistence,
  WeekDTO,
  WeekTodoActivityDTO,
  WeekTodoDTO,
} from "../environment/Persistence";
import { FamilyScrumState } from "./FamilyScrumState";
import { FamilyMember } from "./FamilyState";

import { DocumentChange } from "firebase/firestore";
import { DinnerState } from "./DinnerState";
import { TodoState } from "./TodoState";

export type WeekState = ReturnType<typeof WeekState>;

export type WeekDinner = {
  id: string;
  dinner: DinnerState;
  weekDay: number;
};

export type WeekTodoAssignment = {
  familyMember: FamilyMember;
  activity: WeekTodoActivityDTO;
};

export type WeekTodo = {
  id: string;
  todo: TodoState;
  assignments: WeekTodoAssignment[];
};

type Params = {
  weekId: string;
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrumState;
  onDispose: (dispose: () => void) => void;
};

export function WeekState({
  weekId,
  familyPersistence,
  familyScrum,
  onDispose,
}: Params) {
  const weekTodosApi = familyPersistence.createWeekTodosApi(weekId);
  const week = reactive({
    id: weekId,
    dinners: [] as WeekDinner[],
    todos: [] as WeekTodo[],
  });

  onDispose(familyPersistence.weeks.subscribe(weekId, createWeekDinners));

  onDispose(weekTodosApi.subscribeChanges(createWeekTodos));

  return week;

  function createWeekDinners(data: WeekDTO) {
    week.dinners = data.dinners
      .map((id, index): WeekDinner | null => {
        const dinner = familyScrum.dinners.dinners.find(
          (dinner) => dinner.id === id
        );

        return dinner ? { id: dinner.id, dinner, weekDay: index } : null;
      })
      .filter((dinner) => !!dinner);
  }

  function createWeekTodos(changes: DocumentChange<WeekTodoDTO>[]) {
    for (const change of changes) {
      switch (change.type) {
        case "added": {
          const weekTodo = createWeekTodo(change.doc.data());

          if (!weekTodo) {
            return;
          }

          week.todos.push(weekTodo);
          break;
        }
        case "modified": {
          const weekTodo = week.todos.find((todo) => todo.id === change.doc.id);

          if (!weekTodo) {
            return;
          }

          weekTodo.assignments = deriveAssignments(change.doc.data());

          break;
        }
        case "removed": {
          const weekTodoIndex = week.todos.findIndex(
            (todo) => todo.id === change.doc.id
          );

          week.todos.splice(weekTodoIndex, 1);

          break;
        }
      }
    }
  }

  function createWeekTodo(weekTodoData: WeekTodoDTO) {
    const todo = familyScrum.todos.todos.find(
      (todo) => todo.id === weekTodoData.id
    );

    if (!todo) {
      return null;
    }

    const weekTodo = reactive<WeekTodo>({
      id: todo.id,
      todo,
      assignments: deriveAssignments(weekTodoData),
    });

    return weekTodo;
  }

  function deriveAssignments(weekTodoData: WeekTodoDTO) {
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
}
