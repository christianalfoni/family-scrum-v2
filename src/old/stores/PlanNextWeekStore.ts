import { derived, signal, store } from "impact-app";
import { useWeeks } from "./WeeksStore";
import { useTodos } from "./TodosStore";
import { getDateFromWeekId, isWithinWeek } from "../utils";
import { differenceInDays } from "date-fns";
import {
  TodoDTO,
  UserDTO,
  WeekTodoActivity,
  useFirebase,
  WeekDinnersDTO,
} from "./FirebaseStore";
import { Transaction } from "firebase/firestore";

export function PlanNextWeekStore(user: UserDTO) {
  const firebase = useFirebase();
  const { previous, current, next } = useWeeks();
  const { todos: todosPromise } = useTodos();
  const weeksCollection = firebase.collections.weeks(user.familyId);
  const nextWeekTodosCollection = firebase.collections.weekTodos(
    user.familyId,
    next.id,
  );
  const settingNextWeekTodoActivity = signal<Promise<Transaction>>();
  const settingsNextWeekDinner = signal<Promise<void>>();

  const todos = derived<{
    previousWeek: TodoDTO[];
    eventsThisWeek: TodoDTO[];
    laterEvents: TodoDTO[];
    thisWeek: TodoDTO[];
  }>(() => {
    if (
      previous.weekTodos.status !== "fulfilled" ||
      todosPromise.status !== "fulfilled"
    ) {
      return {
        previousWeek: [],
        eventsThisWeek: [],
        laterEvents: [],
        thisWeek: [],
      };
    }

    const previousWeekTodos = previous.weekTodos.value;
    const todos = todosPromise.value;

    const todosInPreviousWeek = previousWeekTodos.filter((previousWeekTodo) => {
      for (let userId in previousWeekTodo.activityByUserId) {
        if (previousWeekTodo.activityByUserId[userId].includes(true)) {
          return true;
        }
      }

      return false;
    });
    const currentWeekDate = getDateFromWeekId(current.id);
    const result = todos.reduce(
      (aggr, todo) => {
        if (
          todosInPreviousWeek.find(
            (previousWeekTodo) => previousWeekTodo.id === todo.id,
          )
        ) {
          aggr.previousWeek.push(todo);

          return aggr;
        }
        if (todo.date && isWithinWeek(todo.date.toMillis(), currentWeekDate)) {
          aggr.eventsThisWeek.push(todo);
          return aggr;
        }

        if (
          todo.date &&
          differenceInDays(todo.date.toMillis(), currentWeekDate) > 7
        ) {
          aggr.laterEvents.push(todo);
          return aggr;
        }

        if (!todo.date) {
          aggr.thisWeek.push(todo);
          return aggr;
        }

        return aggr;
      },
      {
        previousWeek: [] as TodoDTO[],
        eventsThisWeek: [] as TodoDTO[],
        laterEvents: [] as TodoDTO[],
        thisWeek: [] as TodoDTO[],
      },
    );

    result.eventsThisWeek.sort((a, b) => {
      if (a.date! > b.date!) {
        return 1;
      }

      if (a.date! < b.date!) {
        return -1;
      }

      return 0;
    });

    result.laterEvents.sort((a, b) => {
      if (a.date! > b.date!) {
        return 1;
      }

      if (a.date! < b.date!) {
        return -1;
      }

      return 0;
    });

    return result;
  });

  return {
    get todos() {
      return todos.value;
    },
    // We need to run a transaction here because multiple users can be editing this at the same time
    settingNextWeekTodoActivity,
    setNextWeekTodoActivity(
      todoId: string,
      weekdayIndex: number,
      active: boolean,
    ) {
      settingNextWeekTodoActivity.value = firebase.transactDoc(
        nextWeekTodosCollection,
        todoId,
        (data) => {
          const weekTodoActivity: WeekTodoActivity = data?.activityByUserId[
            user.id
          ] ?? [false, false, false, false, false, false, false];

          return {
            id: todoId,
            activityByUserId: {
              ...data?.activityByUserId,
              [user.id]: [
                ...weekTodoActivity.slice(0, weekdayIndex),
                active,
                ...weekTodoActivity.slice(weekdayIndex + 1),
              ] as WeekTodoActivity,
            },
          };
        },
      );

      return settingNextWeekTodoActivity.value;
    },
    get settingsNextWeekDinner() {
      return settingsNextWeekDinner.value;
    },
    setNextWeekDinners(dinners: WeekDinnersDTO) {
      settingsNextWeekDinner.value = firebase.setDoc(weeksCollection, {
        id: next.id,
        dinners,
      });

      return settingsNextWeekDinner.value;
    },
  };
}

export const usePlanNextWeek = () => store(PlanNextWeekStore);
