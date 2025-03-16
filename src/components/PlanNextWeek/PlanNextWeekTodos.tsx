import { CalendarIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { getDateFromWeekId, isWithinWeek } from "../../utils";
import { differenceInDays } from "date-fns";
import { Todo } from "../Todo";
import { TodoAssignment } from "./TodoAssignment";
import { useFamilyScrum } from "../FamilyScrum/useFamilyScrum";
import { TodoDTO } from "../../environments/Browser/Persistence";
import { useReactiveMemo } from "use-reactive-react";

export function PlanNextWeekTodos() {
  const familyScrum = useFamilyScrum();
  const categorisedTodosMemo = useReactiveMemo(deriveCategorizedTodos);

  const renderTodo = (todo: TodoDTO) => (
    <Todo todo={todo}>
      <TodoAssignment todo={todo} />
    </Todo>
  );

  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
      {categorisedTodosMemo.current.previousWeek.length ? (
        <>
          <li className="p-2 bg-green-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> Previous Week
          </li>
          {categorisedTodosMemo.current.previousWeek.map(renderTodo)}
        </>
      ) : null}
      {categorisedTodosMemo.current.eventsThisWeek.length ? (
        <>
          <li className="p-2 bg-red-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> Events This Week
          </li>
          {categorisedTodosMemo.current.eventsThisWeek.map(renderTodo)}
        </>
      ) : null}
      {categorisedTodosMemo.current.thisWeek.length ? (
        <>
          <li className="p-2 bg-yellow-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> This Week
          </li>
          {categorisedTodosMemo.current.thisWeek.map(renderTodo)}
        </>
      ) : null}
      {categorisedTodosMemo.current.laterEvents.length ? (
        <>
          <li className="p-2 bg-blue-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> Later Events
          </li>
          {categorisedTodosMemo.current.laterEvents.map(renderTodo)}
        </>
      ) : null}
    </ul>
  );

  function deriveCategorizedTodos() {
    const todosInPreviousWeek = familyScrum.weeks.previous.todos;
    const currentWeekDate = getDateFromWeekId(familyScrum.weeks.current.id);
    const result = familyScrum.todos.todos.reduce(
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
        previousWeek: [] as TodoDTO[],
        eventsThisWeek: [] as TodoDTO[],
        laterEvents: [] as TodoDTO[],
        thisWeek: [] as TodoDTO[],
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
