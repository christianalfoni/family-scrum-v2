import { createDataLookup, reactive } from "bonsify";
import {
  FamilyPersistence,
  WeekDTO,
  WeekTodoDTO,
} from "../environments/Browser/Persistence";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { FamilyScrum } from "./FamilyScrum";

import { WeekDinner } from "./WeekDinner";
import { WeekTodo } from "./WeekTodo";
import { WeekEvent } from "./WeekEvent";

export type Week = {
  id: string;
  dinners: WeekDinner[];
  dinnersById: Record<string, WeekDinner>;
  todos: WeekTodo[];
  todosById: Record<string, WeekTodo>;
  events: WeekEvent[];
  eventsById: Record<string, WeekEvent>;
};

export type Weeks = {
  familyScrum: FamilyScrum;
  previous: Week;
  current: Week;
  next: Week;
};

type Params = {
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrum;
  onDispose: (dispose: () => void) => void;
};

export function Weeks({
  familyScrum,
  familyPersistence,
  onDispose,
}: Params): Weeks {
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();
  const [previous, current, next] = [
    previousWeekId,
    currentWeekId,
    nextWeekId,
  ].map(Week);

  const weeks = reactive<Weeks>({
    familyScrum,
    previous,
    next,
    current,
  });

  return reactive.readonly(weeks);

  function Week(weekId: string) {
    const weekTodosApi = familyPersistence.createWeekTodosApi(weekId);
    const week = reactive<Week>({
      id: weekId,
      dinners: [],
      dinnersById: {},
      todos: [],
      todosById: {},
      events: [],
      eventsById: {},
    });

    onDispose(familyPersistence.weeks.subscribe(weekId, createWeekDinners));

    onDispose(weekTodosApi.subscribeAll(createWeekTodos));

    return week;

    function createWeekDinners(data: WeekDTO) {
      week.dinners = data.dinners
        .map((id, index) => {
          const dinner = id && familyScrum.dinners.dinnersById[id];

          return dinner ? WeekDinner({ dinner, weekDayIndex: index }) : null;
        })
        .filter((dinner) => dinner !== null);
      week.dinnersById = createDataLookup(week.dinners);
    }

    function createWeekTodos(data: WeekTodoDTO[]) {
      week.todos = data.flatMap(createWeekTodo).filter((todo) => todo !== null);
      week.todosById = createDataLookup(week.todos);
    }

    function createWeekTodo(weekTodoData: WeekTodoDTO) {
      let assignmentsByDay: string[][] = [[], [], [], [], [], [], []];

      for (const userId in weekTodoData.activityByUserId) {
        const activity = weekTodoData.activityByUserId[userId];

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          if (activity[dayIndex]) {
            assignmentsByDay[dayIndex].push(userId);
          }
        }
      }

      return assignmentsByDay.map((assignments, index) => {
        const todo = familyScrum.todos.todosById[weekTodoData.id];

        return assignments.length && todo
          ? WeekTodo({
              todo,
              weekDayIndex: index,
              assignments,
              familyScrum,
            })
          : null;
      });
    }
  }
}
