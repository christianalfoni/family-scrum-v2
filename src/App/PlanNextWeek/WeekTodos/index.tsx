import * as React from "react";

import { useTranslations } from "next-intl";
import { CalendarIcon, CheckCircleIcon } from "@heroicons/react/outline";
import { PlanTodoItem } from "./PlanTodoItem";
import { TodoDTO } from "../../../useGlobalContext/firebase";
import { useWeekTodosContext } from "./useWeekTodosContext";

const WeekTodosContent = () => {
  const { categorisedTodos } = useWeekTodosContext();
  const t = useTranslations("PlanWeekView");

  const renderTodo = (todo: TodoDTO) => (
    <PlanTodoItem key={todo.id} todo={todo} />
  );

  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
      {categorisedTodos.previousWeek.length ? (
        <>
          <li className="p-2 bg-green-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> {t("typePreviousWeek")}
          </li>
          {categorisedTodos.previousWeek.map(renderTodo)}
        </>
      ) : null}
      {categorisedTodos.eventsThisWeek.length ? (
        <>
          <li className="p-2 bg-red-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> {t("typeEventsThisWeek")}
          </li>
          {categorisedTodos.eventsThisWeek.map(renderTodo)}
        </>
      ) : null}
      {categorisedTodos.thisWeek.length ? (
        <>
          <li className="p-2 bg-yellow-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> {t("typeThisWeek")}
          </li>
          {categorisedTodos.thisWeek.map(renderTodo)}
        </>
      ) : null}
      {categorisedTodos.laterEvents.length ? (
        <>
          <li className="p-2 bg-blue-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> {t("typeLaterEvents")}
          </li>
          {categorisedTodos.laterEvents.map(renderTodo)}
        </>
      ) : null}
    </ul>
  );
};

export const WeekTodos = () => (
  <useWeekTodosContext.Provider>
    <WeekTodosContent />
  </useWeekTodosContext.Provider>
);
