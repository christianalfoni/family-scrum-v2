import { context } from "impact-context";
import { derived } from "impact-signal";
import { useAppContext } from "../useAppContext";
import { TodoDTO } from "../../useGlobalContext/firebase";
import { getDay, isThisWeek } from "date-fns";
import { mod } from "../../utils";

export type WeekdayTodos = {
  [todoId: string]: string[];
};

function DashboardContext() {
  const { weeks, todosPromise } = useAppContext();

  const todosByWeekdaySignal = derived(() => {
    const currentWeekTodosPromise = weeks.current.weekTodos;
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
  const eventsByWeekdaySignal = derived(() => {
    const eventsByWeekday: [
      TodoDTO[],
      TodoDTO[],
      TodoDTO[],
      TodoDTO[],
      TodoDTO[],
      TodoDTO[],
      TodoDTO[],
    ] = [[], [], [], [], [], [], []];
    console.log("EHM", todosPromise.status);
    if (todosPromise.status !== "fulfilled") {
      return eventsByWeekday;
    }
    console.log("UHM");

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
      return todosByWeekdaySignal.value;
    },
    get eventsByWeekday() {
      return eventsByWeekdaySignal.value;
    },
  };
}

export const useDashboardContext = context(DashboardContext);
