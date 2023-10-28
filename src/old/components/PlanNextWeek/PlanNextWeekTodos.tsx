import * as React from "react";

import { useTranslations } from "next-intl";
import { CalendarIcon, CheckCircleIcon } from "@heroicons/react/outline";

import { useFamily } from "../../stores/FamilyStore";

import { useWeeks } from "../../stores/WeeksStore";
import { TodoDTO } from "../../stores/FirebaseStore";

import { useViewStack } from "../../stores/ViewStackStore";
import { useUser } from "../../stores/UserStore";
import { PlanTodoItem } from "./PlanTodoItem";
import { use } from "impact-app";
import { usePlanNextWeek } from "../../stores/PlanNextWeekStore";

export const PlanNextWeekTodos = () => {
  const user = useUser();
  const viewStack = useViewStack();
  const { family: familyPromise } = useFamily();
  const { next } = useWeeks();
  const { todos } = usePlanNextWeek();

  const family = use(familyPromise);
  const nextWeekTodos = use(next.weekTodos);

  const t = useTranslations("PlanWeekView");

  const onTodoClick = React.useCallback(
    (id: string) =>
      viewStack.push({
        name: "EDIT_TODO",
        id,
      }),
    [],
  );

  const renderTodo = (todo: TodoDTO) => (
    <PlanTodoItem key={todo.id} todo={todo} />
  );

  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
      {todos.previousWeek.length ? (
        <>
          <li className="p-2 bg-green-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> {t("typePreviousWeek")}
          </li>
          {todos.previousWeek.map(renderTodo)}
        </>
      ) : null}
      {todos.eventsThisWeek.length ? (
        <>
          <li className="p-2 bg-red-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> {t("typeEventsThisWeek")}
          </li>
          {todos.eventsThisWeek.map(renderTodo)}
        </>
      ) : null}
      {todos.thisWeek.length ? (
        <>
          <li className="p-2 bg-yellow-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> {t("typeThisWeek")}
          </li>
          {todos.thisWeek.map(renderTodo)}
        </>
      ) : null}
      {todos.laterEvents.length ? (
        <>
          <li className="p-2 bg-blue-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> {t("typeLaterEvents")}
          </li>
          {todos.laterEvents.map(renderTodo)}
        </>
      ) : null}
    </ul>
  );
};
