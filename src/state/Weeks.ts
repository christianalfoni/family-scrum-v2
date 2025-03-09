import { reactive } from "bonsify";
import {
  FamilyPersistence,
  WeekDTO,
  WeekTodoDTO,
} from "../environments/Browser/Persistence";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { FamilyScrum } from "./FamilyScrum";

export type Week = WeekDTO & {
  todos: any;
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
    const week = reactive<Week>({
      id: weekId,
      dinners: [null, null, null, null, null, null, null],
      todos: [],
    });

    onDispose(
      familyPersistence.weeks.subscribe(weekId, (update) => {
        week.dinners = update.dinners;
      })
    );

    const weekTodosApi = familyPersistence.createWeekTodosApi(weekId);

    onDispose(
      weekTodosApi.subscribeAll((data) => {
        week.todos = data;
      })
    );

    return week;
  }
}
