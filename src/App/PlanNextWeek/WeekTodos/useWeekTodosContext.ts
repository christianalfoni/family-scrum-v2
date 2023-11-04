import { derived } from "impact-signal";
import { context } from "impact-context";
import { useAppContext } from "../../useAppContext";
import { TodoDTO } from "../../../useGlobalContext/firebase";
import { getDateFromWeekId, isWithinWeek } from "../../../utils";
import { differenceInDays } from "date-fns";

function WeekTodosContext() {
  const { weeks, todos: todosPromise } = useAppContext();

  const categorisedTodos = derived<{
    previousWeek: TodoDTO[];
    eventsThisWeek: TodoDTO[];
    laterEvents: TodoDTO[];
    thisWeek: TodoDTO[];
  }>(() => {
    if (
      weeks.previous.weekTodos.status !== "fulfilled" ||
      todosPromise.status !== "fulfilled"
    ) {
      return {
        previousWeek: [],
        eventsThisWeek: [],
        laterEvents: [],
        thisWeek: [],
      };
    }

    const previousWeekTodos = weeks.previous.weekTodos.value;
    const todos = todosPromise.value;

    const todosInPreviousWeek = Object.values(previousWeekTodos).filter(
      (previousWeekTodo) => {
        for (let userId in previousWeekTodo.activityByUserId) {
          if (previousWeekTodo.activityByUserId[userId].includes(true)) {
            return true;
          }
        }

        return false;
      },
    );
    const currentWeekDate = getDateFromWeekId(weeks.current.id);
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
    get categorisedTodos() {
      return categorisedTodos.value;
    },
  };
}

export const useWeekTodosContext = context(WeekTodosContext);
