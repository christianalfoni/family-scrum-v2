import { CalendarIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import * as state from "../../state";
import { getDateFromWeekId, isWithinWeek } from "../../utils";
import { differenceInDays } from "date-fns";

type Props = {
  todos: state.Todos;
  weeks: state.Weeks;
};

export function PlanNextWeekTodos({ todos, weeks }: Props) {
  const categorisedTodos = computeCategorizedTodos();
  const renderTodo = (todo: state.Todo) => null;

  console.log("RENDER", categorisedTodos);

  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
      {categorisedTodos.previousWeek.length ? (
        <>
          <li className="p-2 bg-green-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> Previous Week
          </li>
          {categorisedTodos.previousWeek.map(renderTodo)}
        </>
      ) : null}
      {categorisedTodos.eventsThisWeek.length ? (
        <>
          <li className="p-2 bg-red-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> Events This Week
          </li>
          {categorisedTodos.eventsThisWeek.map(renderTodo)}
        </>
      ) : null}
      {categorisedTodos.thisWeek.length ? (
        <>
          <li className="p-2 bg-yellow-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> This Week
          </li>
          {categorisedTodos.thisWeek.map(renderTodo)}
        </>
      ) : null}
      {categorisedTodos.laterEvents.length ? (
        <>
          <li className="p-2 bg-blue-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> Later Events
          </li>
          {categorisedTodos.laterEvents.map(renderTodo)}
        </>
      ) : null}
    </ul>
  );

  function computeCategorizedTodos() {
    const todosInPreviousWeek = weeks.previous.todos;
    const currentWeekDate = getDateFromWeekId(weeks.current.id);
    const result = todos.todos.reduce(
      (aggr, todo) => {
        if (
          todosInPreviousWeek.find(
            (previousWeekTodo) => previousWeekTodo.id === todo.id
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
        previousWeek: [] as state.Todo[],
        eventsThisWeek: [] as state.Todo[],
        laterEvents: [] as state.Todo[],
        thisWeek: [] as state.Todo[],
      }
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
  }
}
