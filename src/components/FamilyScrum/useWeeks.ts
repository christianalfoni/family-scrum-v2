import {
  getCurrentWeekId,
  getNextWeekId,
  getPreviousWeekId,
} from "../../utils";
import { useReactive, useReactiveEffect } from "use-reactive-react";
import { useEnv } from "../../environments";
import {
  WeekDinnersDTO,
  WeekTodoDTO,
} from "../../environments/Browser/Persistence";

export type Week = {
  id: string;
  dinners: WeekDinnersDTO;
  todos: WeekTodoDTO[];
};

export type Weeks = {
  previous: Week;
  current: Week;
  next: Week;
};

export function useWeeks(familyId: string): Weeks {
  const env = useEnv();
  const familyPersistence = env.persistence.getFamilyApi(familyId);
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();

  // const state = useReactive({ count: 0, increase() { state.count++ } });

  const weeks = useReactive<Weeks>(createWeeks);

  useReactiveEffect(subscribeWeekDinners);
  useReactiveEffect(subscribeWeekTodos);

  return useReactive.readonly(weeks);

  function createWeeks() {
    const [previous, current, next] = [
      previousWeekId,
      currentWeekId,
      nextWeekId,
    ].map(
      (id): Week => ({
        id,
        dinners: [null, null, null, null, null, null, null],
        todos: [],
      })
    );

    return {
      previous,
      next,
      current,
    };
  }

  function subscribeWeekDinners() {
    const weekDisposers = [
      familyPersistence.weeks.subscribe(
        weeks.previous.id,
        (data) => (weeks.previous.dinners = data.dinners)
      ),
      familyPersistence.weeks.subscribe(
        weeks.current.id,
        (data) => (weeks.current.dinners = data.dinners)
      ),
      familyPersistence.weeks.subscribe(
        weeks.next.id,
        (data) => (weeks.next.dinners = data.dinners)
      ),
    ];

    return () => {
      weekDisposers.forEach((dispose) => dispose());
    };
  }

  function subscribeWeekTodos() {
    const weekTodosDisposers = [
      familyPersistence
        .getWeekTodosApi(weeks.previous.id)
        .subscribeAll((data) => {
          weeks.previous.todos = data;
        }),
      familyPersistence
        .getWeekTodosApi(weeks.current.id)
        .subscribeAll((data) => {
          weeks.current.todos = data;
        }),
      familyPersistence.getWeekTodosApi(weeks.next.id).subscribeAll((data) => {
        weeks.next.todos = data;
      }),
    ];

    return () => {
      weekTodosDisposers.forEach((dispose) => dispose());
    };
  }
}
