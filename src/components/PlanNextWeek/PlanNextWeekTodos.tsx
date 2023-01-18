import * as React from "react";
import * as selectors from "../../selectors";
import { useTranslations } from "next-intl";
import { CalendarIcon, CheckCircleIcon } from "@heroicons/react/outline";

import { weekdays } from "../../utils";
import {
  CheckListItemDTO,
  FamilyDTO,
  TodoDTO,
  WeekDTO,
} from "../../environment-interface/storage";

import { TodoItem } from "../TodoItem";

import { FamilyUserDTO } from "../../environment-interface/authentication";
import { User } from "../../hooks/useCurrentUser";
import { useSuspendCaches } from "../../useCache";
import { useFamily } from "../../hooks/useFamily";
import { useTodos } from "../../hooks/useTodos";
import { useWeeks } from "../../hooks/useWeeks";
import {
  useCheckListItems,
  useCheckListItemsByTodoId,
} from "../../hooks/useCheckListItems";
import { ViewAction } from "../Dashboard/useViewStack";

const PlanTodoItem = React.memo(
  ({
    todo,
    userIds,
    user,
    checkListItems,
    family,
    toggleWeekday,
    previousWeek,
    week,
    onClick,
  }: {
    todo: TodoDTO;
    user: FamilyUserDTO;
    checkListItems: Record<string, CheckListItemDTO>;
    family: FamilyDTO;
    userIds: string[];
    previousWeek: WeekDTO;
    week: WeekDTO;
    toggleWeekday: (data: {
      active: boolean;
      todoId: string;
      userId: string;
      weekdayIndex: number;
    }) => void;
    onClick: (id: string) => void;
  }) => (
    <TodoItem
      todo={todo}
      checkListItems={checkListItems}
      user={user}
      onClick={() => onClick(todo.id)}
    >
      {userIds.map((userId) => {
        const weekActivity = week.todos[todo.id]?.[userId] ?? [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ];
        const previousWeekActivity = previousWeek.todos[todo.id]?.[userId];

        return (
          <div key={userId} className="flex pt-2 items-center justify-between">
            <img
              key={userId}
              className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
              src={family.users[userId].avatar!}
              alt={family.users[userId].name}
            />
            {weekActivity.map((isActive, index) => {
              const activePreviousWeek = Boolean(previousWeekActivity?.[index]);

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
  )
);

export const PlanNextWeekTodos = ({
  user,
  dispatchViewStack,
  toggleWeekday,
}: {
  user: User;
  dispatchViewStack: React.Dispatch<ViewAction>;
  toggleWeekday: (params: {
    active: boolean;
    todoId: string;
    userId: string;
    weekdayIndex: number;
  }) => void;
}) => {
  const [familyCache, todosCache, weeksCache, checkListItemsCache] =
    useSuspendCaches([
      useFamily(user),
      useTodos(user),
      useWeeks(user),
      useCheckListItems(user),
    ]);
  const family = familyCache.read().data;
  const todos = todosCache.read().data;
  const checkListItems = checkListItemsCache.read().data;
  const { currentWeek, nextWeek, previousWeek } = weeksCache.read().data;
  const checkListItemsByTodoId = useCheckListItemsByTodoId(checkListItems);
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
  const onTodoClick = React.useCallback(
    (id: string) =>
      dispatchViewStack({
        type: "PUSH_VIEW",
        view: {
          name: "EDIT_TODO",
          id,
        },
      }),
    []
  );

  const renderTodo = (todo: TodoDTO) => (
    <PlanTodoItem
      key={todo.id}
      family={family}
      week={nextWeek}
      checkListItems={checkListItemsByTodoId[todo.id]}
      previousWeek={previousWeek}
      todo={todo}
      toggleWeekday={toggleWeekday}
      user={user}
      userIds={sortedUserIds}
      onClick={onTodoClick}
    />
  );

  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
      {sortedTodos.previousWeek.length ? (
        <>
          <li className="p-2 bg-green-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> {t("typePreviousWeek")}
          </li>
          {sortedTodos.previousWeek.map(renderTodo)}
        </>
      ) : null}
      {sortedTodos.eventsThisWeek.length ? (
        <>
          <li className="p-2 bg-red-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> {t("typeEventsThisWeek")}
          </li>
          {sortedTodos.eventsThisWeek.map(renderTodo)}
        </>
      ) : null}
      {sortedTodos.thisWeek.length ? (
        <>
          <li className="p-2 bg-yellow-500 text-white font-bold text-sm flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2" /> {t("typeThisWeek")}
          </li>
          {sortedTodos.thisWeek.map(renderTodo)}
        </>
      ) : null}
      {sortedTodos.laterEvents.length ? (
        <>
          <li className="p-2 bg-blue-500 text-white font-bold text-sm flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" /> {t("typeLaterEvents")}
          </li>
          {sortedTodos.laterEvents.map(renderTodo)}
        </>
      ) : null}
    </ul>
  );
};
