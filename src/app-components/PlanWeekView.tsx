import * as React from "react";
import { planWeekSelectors, usePlanWeek } from "../features/PlanWeekFeature";
import { useTranslations, useIntl } from "next-intl";
import { Menu, Transition } from "@headlessui/react";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ClockIcon,
  SelectorIcon,
} from "@heroicons/react/outline";
import {
  CheckListItem,
  CheckListItemsByTodoId,
  Family,
  Todo,
  Todos,
  User,
  Week,
} from "../features/DashboardFeature/Feature";
import { getCurrentWeekId, weekdays } from "../utils";
import { WeekTodoActivity } from "../environment/storage";
import { dashboardSelectors, useDasbhoard } from "../features/DashboardFeature";
import { useTodos } from "../features/TodosFeature";
import { TodoItem } from "../common-components/TodoItem";

const Confirmed = () => (
  <div className="absolute z-10 top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-white">
    <svg
      className="checkmark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
    >
      <circle
        className="checkmark__circle"
        cx="26"
        cy="26"
        r="25"
        fill="none"
      />
      <path
        className="checkmark__check"
        fill="none"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
    </svg>
  </div>
);

const PlanTodoItem = React.memo(
  ({
    todo,
    userIds,
    family,
    week,
    previousWeek,
    user,
    archiveTodo,
    toggleWeekday,
    toggleItemCompleted,
    deleteItem,
    addItem,
    checkListItems,
  }: {
    todo: Todo;
    userIds: string[];
    family: Family;
    week: Week;
    previousWeek: Week;
    user: User;
    archiveTodo: (id: string) => void;
    toggleWeekday: (data: {
      active: boolean;
      todoId: string;
      userId: string;
      weekdayIndex: number;
    }) => void;
    toggleItemCompleted: (id: string) => void;
    deleteItem: (itemId: string) => void;
    addItem: (todoId: string, title: string) => void;
    checkListItems: {
      [itemId: string]: CheckListItem;
    };
  }) => {
    return (
      <TodoItem
        todo={todo}
        deleteItem={deleteItem}
        checkListItems={checkListItems}
        addItem={addItem}
        toggleItemCompleted={toggleItemCompleted}
        archiveTodo={archiveTodo}
      >
        {userIds.map((userId) => {
          const weekActivity: WeekTodoActivity = week.todos[todo.id]?.[
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

export const PlanWeekView = ({
  user,
  family,
  todos,
  week,
  previousWeek,
  onBackClick,
  checkListItemsByTodoId,
}: {
  user: User;
  family: Family;
  week: Week;
  previousWeek: Week;
  todos: Todos;
  onBackClick: () => void;
  checkListItemsByTodoId: CheckListItemsByTodoId;
}) => {
  const [, sendDashboard] = useDasbhoard("LOADED");
  const [, send] = usePlanWeek();
  const [, sendTodos] = useTodos();
  const t = useTranslations("PlanWeekView");
  const sortedTodos = planWeekSelectors.todosByType(todos, previousWeek);
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
  const archiveTodo = React.useCallback((todoId: string) => {
    sendTodos({
      type: "ARCHIVE_TODO",
      todoId,
    });
  }, []);
  const toggleItemCompleted = React.useCallback((itemId: string) => {
    sendTodos({
      type: "TOGGLE_CHECKLIST_ITEM",
      itemId,
    });
  }, []);
  const deleteItem = React.useCallback((itemId: string) => {
    sendTodos({
      type: "DELETE_CHECKLIST_ITEM",
      itemId,
    });
  }, []);
  const addItem = React.useCallback((todoId: string, title: string) => {
    sendTodos({
      type: "ADD_CHECKLIST_ITEM",
      todoId,
      title,
    });
  }, []);
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
      send({
        type: "TOGGLE_WEEKDAY",
        active,
        todoId,
        userId,
        weekdayIndex,
      });
    },
    []
  );
  const isCurrentWeek = week.id === getCurrentWeekId();

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <div className="flex-1">
            <button
              onClick={onBackClick}
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <Menu as="div" className="relative flex-2 text-left">
            {({ open }) => (
              <>
                <div>
                  <Menu.Button className="group w-full rounded-md px-3.5 py-2 text-sm text-left font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-red-500">
                    <span className="flex w-full justify-between items-center">
                      <span className="flex min-w-0 items-center justify-between space-x-3">
                        <span className="flex-1 flex flex-col min-w-0">
                          <span className="text-gray-900 text-lg font-medium truncate">
                            {isCurrentWeek
                              ? t("planCurrentWeek")
                              : t("planNextWeek")}
                          </span>
                        </span>
                      </span>
                      <SelectorIcon
                        className="flex-shrink-0 ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                    </span>
                  </Menu.Button>
                </div>
                <Transition
                  show={open}
                  as={React.Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items
                    static
                    className="z-10 mx-3 origin-top absolute right-0 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none"
                  >
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            onClick={() => {
                              sendDashboard({
                                type: "VIEW_SELECTED",
                                view: {
                                  state: "PLAN_CURRENT_WEEK",
                                },
                              });
                            }}
                            className={`
                                ${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                } 
                                block px-4 py-2 text-sm whitespace-nowrap
                              `}
                          >
                            {t("planCurrentWeek")}
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            onClick={() => {
                              sendDashboard({
                                type: "VIEW_SELECTED",
                                view: {
                                  state: "PLAN_NEXT_WEEK",
                                },
                              });
                            }}
                            className={`
                              ${
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700"
                              } 
                              block px-4 py-2 text-sm whitespace-nowrap
                            `}
                          >
                            {t("planNextWeek")}
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>
          <span className="flex-1" />
        </div>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
        {sortedTodos.previousWeek.length ? (
          <>
            <li className="p-2 bg-green-500 text-white font-bold text-sm flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2" />{" "}
              {t("typePreviousWeek")}
            </li>
            {sortedTodos.previousWeek.map((todo) => (
              <PlanTodoItem
                key={todo.id}
                checkListItems={checkListItemsByTodoId[todo.id]}
                todo={todo}
                archiveTodo={archiveTodo}
                family={family}
                previousWeek={previousWeek}
                toggleWeekday={toggleWeekday}
                user={user}
                userIds={sortedUserIds}
                week={week}
                addItem={addItem}
                deleteItem={deleteItem}
                toggleItemCompleted={toggleItemCompleted}
              />
            ))}
          </>
        ) : null}
        {sortedTodos.eventsThisWeek.length ? (
          <>
            <li className="p-2 bg-red-500 text-white font-bold text-sm flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />{" "}
              {t("typeEventsThisWeek")}
            </li>
            {sortedTodos.eventsThisWeek.map((todo) => (
              <PlanTodoItem
                key={todo.id}
                checkListItems={checkListItemsByTodoId[todo.id]}
                todo={todo}
                archiveTodo={archiveTodo}
                family={family}
                previousWeek={previousWeek}
                toggleWeekday={toggleWeekday}
                user={user}
                userIds={sortedUserIds}
                week={week}
                addItem={addItem}
                deleteItem={deleteItem}
                toggleItemCompleted={toggleItemCompleted}
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
                checkListItems={checkListItemsByTodoId[todo.id]}
                todo={todo}
                archiveTodo={archiveTodo}
                family={family}
                previousWeek={previousWeek}
                toggleWeekday={toggleWeekday}
                user={user}
                userIds={sortedUserIds}
                week={week}
                addItem={addItem}
                deleteItem={deleteItem}
                toggleItemCompleted={toggleItemCompleted}
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
                checkListItems={checkListItemsByTodoId[todo.id]}
                todo={todo}
                archiveTodo={archiveTodo}
                family={family}
                previousWeek={previousWeek}
                toggleWeekday={toggleWeekday}
                user={user}
                userIds={sortedUserIds}
                week={week}
                addItem={addItem}
                deleteItem={deleteItem}
                toggleItemCompleted={toggleItemCompleted}
              />
            ))}
          </>
        ) : null}
      </ul>
    </div>
  );
};
