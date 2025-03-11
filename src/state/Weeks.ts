import { reactive } from "bonsify";
import {
  FamilyPersistence,
  WeekDTO,
  WeekTodoDTO,
  WeekTodosApi,
} from "../environments/Browser/Persistence";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { FamilyScrum } from "./FamilyScrum";
import { WeekDinner } from "./WeekDinner";
import { WeekTodo } from "./WeekTodo";
import { WeekEvent } from "./WeekEvent";

export type Week = {
  id: string;
  dinners: WeekDinner[];
  todos: WeekTodo[];
  events: WeekEvent[];
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
      todos: [],
      events: [],
    });

    onDispose(familyPersistence.weeks.subscribe(weekId, createWeekDinners));

    onDispose(weekTodosApi.subscribeAll(createWeekTodos));

    return week;

    function createWeekDinners(data: WeekDTO) {
      week.dinners = data.dinners
        .map((id, index) => {
          const dinner = familyScrum.dinners.dinners.find(
            (dinner) => dinner.id === id
          );

          return dinner ? WeekDinner({ dinner, weekDayIndex: index }) : null;
        })
        .filter((dinner) => !!dinner);
    }

    function createWeekTodos(data: WeekTodoDTO[]) {
      week.todos = data.flatMap(createWeekTodo).filter((todo) => todo !== null);
    }

    function createWeekTodo(weekTodoData: WeekTodoDTO) {
      const todo = familyScrum.todos.todos.find(
        (todo) => todo.id === weekTodoData.id
      );

      if (!todo) {
        return null;
      }

      return WeekTodo({
        todo,
        familyScrum,
        weekTodoData,
        weekTodosApi,
      });
    }
  }
}
