import * as React from "react";
import { usePlanWeek } from "../features/PlanWeekFeature";
import { useTranslations, useIntl } from "next-intl";
import { Menu, Transition } from "@headlessui/react";
import {
  ArchiveIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  DotsVerticalIcon,
  SelectorIcon,
} from "@heroicons/react/outline";
import {
  CalendarEvents,
  Family,
  Todo,
  Todos,
  User,
  Week,
  CalendarEvent,
} from "../features/DashboardFeature/Feature";
import { getCurrentWeekId, weekdays } from "../utils";
import { WeekTodoActivity } from "../environment/storage";
import { dashboardSelectors, useDasbhoard } from "../features/DashboardFeature";

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

const TodoItem = React.memo(
  ({
    todo,
    userIds,
    family,
    week,
    previousWeek,
    user,
    archiveTodo,
    toggleWeekday,
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
  }) => {
    const [archiving, setArchiving] = React.useState(false);

    React.useEffect(() => {
      if (archiving) {
        const id = setTimeout(() => {
          archiveTodo(todo.id);
        }, 1500);

        return () => clearTimeout(id);
      }
    }, [archiving]);

    return (
      <li key={todo.id} className="relative pl-4 pr-6 py-5 ">
        {archiving ? <Confirmed /> : null}
        <div className="flex items-center">
          <span className="block">
            <h2 className="font-medium">{todo.description}</h2>
          </span>
          <CheckCircleIcon
            className="absolute top-2 right-2 text-gray-500 w-6 h-6"
            onClick={() => {
              setArchiving(true);
            }}
          />
        </div>
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
      </li>
    );
  }
);

const CalendarEventItem = React.memo(
  ({
    event,
    onClick,
    family,
    archiveEvent,
  }: {
    event: CalendarEvent;
    onClick: () => void;
    archiveEvent: (id: string) => void;
    family: Family;
  }) => {
    const intl = useIntl();

    const [archiving, setArchiving] = React.useState(false);

    React.useEffect(() => {
      if (archiving) {
        const id = setTimeout(() => {
          archiveEvent(event.id);
        }, 1500);

        return () => clearTimeout(id);
      }
    }, [archiving]);

    return (
      <li className="relative pl-4 pr-6 py-5" onClick={onClick}>
        {archiving ? <Confirmed /> : null}
        <div className="flex items-center">
          <span className="block">
            <span className="flex items-center">
              <CalendarIcon className="text-red-600 w-4 h-4" />
              <h4 className="text-gray-500 text-sm ml-1 mr-2">
                {intl.formatDateTime(event.date, {
                  day: "numeric",
                  month: "long",
                })}
              </h4>
              <div className="flex flex-shrink-0 -space-x-1">
                {event.userIds.map((userId) => (
                  <img
                    key={userId}
                    className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                    src={family.users[userId].avatar!}
                    alt={family.users[userId].name}
                  />
                ))}
              </div>
            </span>
            <h2 className="font-medium">{event.description}</h2>
          </span>
          <CheckCircleIcon
            className="absolute top-2 right-2 text-gray-500 w-6 h-6"
            onClick={() => {
              setArchiving(true);
            }}
          />
        </div>
      </li>
    );
  }
);

export const PlanWeekView = ({
  user,
  family,
  todos,
  events,
  week,
  previousWeek,
  onBackClick,
}: {
  user: User;
  family: Family;
  week: Week;
  events: CalendarEvents;
  previousWeek: Week;
  todos: Todos;
  onBackClick: () => void;
}) => {
  const [, sendDashboard] = useDasbhoard("LOADED");
  const [, send] = usePlanWeek();
  const t = useTranslations("PlanWeekView");
  const sortedTodos = dashboardSelectors.sortedTodos(todos);
  const eventsList = dashboardSelectors.sortedEvents(events);
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
    send({
      type: "ARCHIVE_TODO",
      todoId,
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

          <Menu as="div" className="relative ml-auto text-left">
            {({ open }) => (
              <>
                <div>
                  <Menu.Button className="group w-full rounded-md px-3.5 py-2 text-sm text-left font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-red-500">
                    <span className="flex w-full justify-between items-center">
                      <span className="flex min-w-0 items-center justify-between space-x-3">
                        <span className="flex-1 flex flex-col min-w-0">
                          <span className="text-gray-900 text-md font-medium truncate">
                            {isCurrentWeek ? t("currentWeek") : t("nextWeek")}
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
                            {t("currentWeek")}
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
                            {t("nextWeek")}
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>
        </div>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
        {sortedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            archiveTodo={archiveTodo}
            family={family}
            previousWeek={previousWeek}
            toggleWeekday={toggleWeekday}
            user={user}
            userIds={sortedUserIds}
            week={week}
          />
        ))}
        {eventsList.map((calendarEvent) => (
          <CalendarEventItem
            key={calendarEvent.id}
            event={calendarEvent}
            family={family}
            onClick={() => {
              send({
                type: "TOGGLE_EVENT",
                eventId: calendarEvent.id,
              });
            }}
            archiveEvent={(id) => {
              send({
                type: "ARCHIVE_EVENT",
                eventId: id,
              });
            }}
          />
        ))}
      </ul>
    </div>
  );
};
