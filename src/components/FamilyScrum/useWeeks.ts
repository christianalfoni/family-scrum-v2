import {
  getCurrentWeekId,
  getNextWeekId,
  getPreviousWeekId,
} from "../../utils";
import { useSignal } from "use-react-signal";
import { useEnv } from "../../environments";
import {
  WeekDinnersDTO,
  WeekTodoDTO,
} from "../../environments/Browser/Persistence";
import { useEffect } from "react";

export type Week = {
  id: string;
  dinners: WeekDinnersDTO;
  todos: WeekTodoDTO[];
};

export type Weeks = ReturnType<typeof useWeeks>;

export function useWeeks(familyId: string) {
  const env = useEnv();
  const familyPersistence = env.persistence.getFamilyApi(familyId);
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();
  const [current, setCurrent] = useSignal<Week>({
    id: currentWeekId,
    dinners: [null, null, null, null, null, null, null],
    todos: [],
  });
  const [previous, setPrevious] = useSignal<Week>({
    id: previousWeekId,
    dinners: [null, null, null, null, null, null, null],
    todos: [],
  });
  const [next, setNext] = useSignal<Week>({
    id: nextWeekId,
    dinners: [null, null, null, null, null, null, null],
    todos: [],
  });

  useEffect(subscribeWeekDinners, []);
  useEffect(subscribeWeekTodos, []);

  return {
    current,
    next,
    previous,
  };

  function subscribeWeekDinners() {
    const weekDisposers = [
      familyPersistence.weeks.subscribe(
        previous.value.id,
        (data) => (previous.value.dinners = data.dinners)
      ),
      familyPersistence.weeks.subscribe(
        current.value.id,
        (data) => (current.value.dinners = data.dinners)
      ),
      familyPersistence.weeks.subscribe(
        next.value.id,
        (data) => (next.value.dinners = data.dinners)
      ),
    ];

    return () => {
      weekDisposers.forEach((dispose) => dispose());
    };
  }

  function subscribeWeekTodos() {
    const weekTodosDisposers = [
      familyPersistence
        .getWeekTodosApi(previous.value.id)
        .subscribeAll((data) => {
          setPrevious((prev) => ({
            ...prev,
            todos: data,
          }));
        }),
      familyPersistence
        .getWeekTodosApi(current.value.id)
        .subscribeAll((data) => {
          setCurrent((prev) => ({
            ...prev,
            todos: data,
          }));
        }),
      familyPersistence.getWeekTodosApi(next.value.id).subscribeAll((data) => {
        setNext((prev) => ({
          ...prev,
          todos: data,
        }));
      }),
    ];

    return () => {
      weekTodosDisposers.forEach((dispose) => dispose());
    };
  }
}
