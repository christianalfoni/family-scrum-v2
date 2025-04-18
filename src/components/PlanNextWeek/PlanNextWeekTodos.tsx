import { CalendarIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { getDateFromWeekId, isWithinWeek } from "../../utils";
import { differenceInDays } from "date-fns";
import { Todo } from "../Todo";
import { TodoAssignment } from "./TodoAssignment";
import { useFamilyScrum } from "../FamilyScrumContext";
import { TodoDTO } from "../../environment/Persistence";

export function PlanNextWeekTodos() {
  const { todos, weeks } = useFamilyScrum();

  const categorisedTodos = getCategorizedTodos();
  const renderTodo = (todo: TodoDTO) => (
    <Todo key={todo.id} todo={todo}>
      <TodoAssignment todo={todo} />
    </Todo>
  );

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

  function getCategorizedTodos() {
    const previousWeekTodos = weeks.previous.weekTodosQuery.value || [];
    const allTodos = todos.todosQuery.value || [];
    const currentWeekDate = getDateFromWeekId(weeks.current.id);
    const result = allTodos.reduce(
      (aggr, todo) => {
        if (
          previousWeekTodos.find(
            (previousWeekTodo) => previousWeekTodo.id === todo.id
          )
        ) {
          aggr.previousWeek.push(todo);

          return aggr;
        }

        if (todo.date && isWithinWeek(todo.date, currentWeekDate)) {
          aggr.eventsThisWeek.push(todo);
          return aggr;
        }

        if (todo.date && differenceInDays(todo.date, currentWeekDate) > 7) {
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
