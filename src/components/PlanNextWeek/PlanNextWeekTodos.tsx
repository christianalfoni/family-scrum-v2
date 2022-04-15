import * as React from "react";
import { PlanNextWeekReducer } from "./usePlanNextWeek";
import * as selectors from "../../selectors";
import { useTranslations } from "next-intl";
import { CalendarIcon, CheckCircleIcon } from "@heroicons/react/outline";

import { weekdays } from "../../utils";
import { TodoDTO, WeekTodoActivity } from "../../environment-interface/storage";

import { TodoItem } from "../TodoItem";
import { FamilyUserDTO } from "../../environment-interface/authentication";
import { PickState, StatesDispatcher } from "react-states";
import { DashboardReducer } from "../Dashboard/useDashboard";

const PlanTodoItem = React.memo(
  ({
    todo,
    userIds,
    dashboard,
    user,
    toggleWeekday,
    onClick,
  }: {
    todo: TodoDTO;
    dashboard: PickState<DashboardReducer, "LOADED">;
    userIds: string[];
    user: FamilyUserDTO;
    toggleWeekday: (data: {
      active: boolean;
      todoId: string;
      userId: string;
      weekdayIndex: number;
    }) => void;
    onClick: () => void;
  }) => {
    const { checkListItemsByTodoId, family, previousWeek, nextWeek } =
      dashboard;
    const checkListItems = checkListItemsByTodoId[todo.id];

    return (
      <TodoItem
        todo={todo}
        checkListItems={checkListItems}
        user={user}
        onClick={onClick}
      >
        {userIds.map((userId) => {
          const weekActivity: WeekTodoActivity = nextWeek.todos[todo.id]?.[
            userId
          ] ?? [false, false, false, false, false, false, false];
          return (
            <div
              key={userId}
              className="flex pt-2 items-center justify-between"
            >
              <img
                key={userId}
                className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                src={family.users[userId].avatar!}
                alt={family.users[userId].name}
              />
              {weekActivity.map((isActive, index) => {
                const activePreviousWeek = Boolean(
                  previousWeek.todos[todo.id] &&
                    previousWeek.todos[todo.id][userId] &&
                    previousWeek.todos[todo.id][userId][index]
                );

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={user.id !== userId}
                    onClick={() => {
                      toggleWeekday({
                        active: !isActive,
                        todoId: todo.id,
                        userId,
                        weekdayIndex: index,
                      });
                    }}
                    className={`${
                      isActive
                        ? "text-white bg-red-500"
                        : activePreviousWeek
                        ? "text-gray-700 bg-gray-200"
                        : "text-gray-700 bg-white"
                    } ${
                      user.id === userId ? "" : "opacity-50"
                    } order-1 w-10 h-8 justify-center inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                  >
                    {weekdays[index].substr(0, 2)}
                  </button>
                );
              })}
            </div>
          );
        })}
      </TodoItem>
    );
  }
);

export const PlanNextWeekTodos = ({
  user,
  dashboard,
  planNextWeekDispatcher,
  onTodoClick,
}: {
  dashboard: PickState<DashboardReducer, "LOADED">;
  user: FamilyUserDTO;
  planNextWeekDispatcher: StatesDispatcher<PlanNextWeekReducer>;
  onTodoClick: (id: string) => void;
}) => {
  const {
    family,
    todos,
    currentWeek,
    nextWeek,
    previousWeek,
    checkListItemsByTodoId,
  } = dashboard;
  const t = useTranslations("PlanWeekView");
  const sortedTodos = selectors.todosByType(
    todos,
    previousWeek,
    currentWeek.id
  );
  const sortedUserIds = React.useMemo(
    () =>
      Object.keys(family.users).sort((a) => {
        if (a === user.id) {
          return -1;
        }

        return 1;
      }),
    [family]
  );

  const toggleWeekday = React.useCallback(
    ({
      active,
      todoId,
      userId,
      weekdayIndex,
    }: {
      active: boolean;
      todoId: string;
      userId: string;
      weekdayIndex: number;
    }) => {
      planNextWeekDispatcher({
        type: "TOGGLE_WEEKDAY",
        active,
        todoId,
        userId,
        weekdayIndex,
      });
    },
    []
  );

  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
      {sortedTodos.previousWeek.length ? (
        <>
          <li className="p-2 bg-green-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> {t("typePreviousWeek")}
          </li>
          {sortedTodos.previousWeek.map((todo) => (
            <PlanTodoItem
              key={todo.id}
              dashboard={dashboard}
              todo={todo}
              toggleWeekday={toggleWeekday}
              user={user}
              userIds={sortedUserIds}
              onClick={() => onTodoClick(todo.id)}
            />
          ))}
        </>
      ) : null}
      {sortedTodos.eventsThisWeek.length ? (
        <>
          <li className="p-2 bg-red-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> {t("typeEventsThisWeek")}
          </li>
          {sortedTodos.eventsThisWeek.map((todo) => (
            <PlanTodoItem
              key={todo.id}
              dashboard={dashboard}
              todo={todo}
              toggleWeekday={toggleWeekday}
              user={user}
              userIds={sortedUserIds}
              onClick={() => onTodoClick(todo.id)}
            />
          ))}
        </>
      ) : null}
      {sortedTodos.thisWeek.length ? (
        <>
          <li className="p-2 bg-yellow-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> {t("typeThisWeek")}
          </li>
          {sortedTodos.thisWeek.map((todo) => (
            <PlanTodoItem
              key={todo.id}
              dashboard={dashboard}
              todo={todo}
              toggleWeekday={toggleWeekday}
              user={user}
              userIds={sortedUserIds}
              onClick={() => onTodoClick(todo.id)}
            />
          ))}
        </>
      ) : null}
      {sortedTodos.laterEvents.length ? (
        <>
          <li className="p-2 bg-blue-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> {t("typeLaterEvents")}
          </li>
          {sortedTodos.laterEvents.map((todo) => (
            <PlanTodoItem
              key={todo.id}
              dashboard={dashboard}
              todo={todo}
              toggleWeekday={toggleWeekday}
              user={user}
              userIds={sortedUserIds}
              onClick={() => onTodoClick(todo.id)}
            />
          ))}
        </>
      ) : null}
    </ul>
  );
};
