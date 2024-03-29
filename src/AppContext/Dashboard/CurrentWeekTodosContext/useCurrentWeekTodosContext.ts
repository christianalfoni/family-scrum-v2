import { derived, context } from "impact-app";
import { useAppContext } from "../../useAppContext";
import { TodoDTO } from "../../../useGlobalContext/firebase";
import { getDay, isThisWeek } from "date-fns";
import { mod } from "../../../utils";

export type WeekdayTodos = {
  [todoId: string]: string[];
};

/**
 * This context is responsible for handling the state for the week overview on the dashboard
 */
export const useCurrentWeekTodosContext = context(CurrentWeekTodosContext);

function CurrentWeekTodosContext() {
  const { weeks, fetchTodos } = useAppContext();

  const todosByWeekday = derived(() => {
    const currentWeekTodosPromise = weeks.current.fetchWeekTodos();
    const todosByWeekday: [
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
    ] = [{}, {}, {}, {}, {}, {}, {}];

    if (currentWeekTodosPromise.status !== "fulfilled") {
      return todosByWeekday;
    }

    const currentWeekTodos = currentWeekTodosPromise.value;

    for (let todoId in currentWeekTodos) {
      for (let userId in currentWeekTodos[todoId].activityByUserId[todoId]) {
        currentWeekTodos[todoId].activityByUserId[userId].forEach(
          (isActive, index) => {
            if (isActive) {
              if (!todosByWeekday[index][todoId]) {
                todosByWeekday[index][todoId] = [];
              }
              todosByWeekday[index][todoId].push(userId);
            }
          },
        );
      }
    }

    return todosByWeekday;
  });
  const eventsByWeekday = derived(() => {
    const eventsByWeekday: [
      TodoDTO[],
      TodoDTO[],
      TodoDTO[],
      TodoDTO[],
      TodoDTO[],
      TodoDTO[],
      TodoDTO[],
    ] = [[], [], [], [], [], [], []];

    const todosPromise = fetchTodos();

    if (todosPromise.status !== "fulfilled") {
      return eventsByWeekday;
    }

    Object.values(todosPromise.value).forEach((todo) => {
      if (
        todo.date &&
        isThisWeek(todo.date.toMillis(), {
          weekStartsOn: 1,
        })
      ) {
        eventsByWeekday[mod(getDay(todo.date.toMillis()) - 1, 7)].push(todo);
      }
    });

    return eventsByWeekday.map((weekDay) =>
      weekDay.sort((a, b) => {
        if (a.date! > b.date!) {
          return 1;
        }
        if (a.date! < b.date!) {
          return -1;
        }

        return 0;
      }),
    );
  });

  return {
    get todosByWeekday() {
      return todosByWeekday.value;
    },
    get eventsByWeekday() {
      return eventsByWeekday.value;
    },
  };
}
