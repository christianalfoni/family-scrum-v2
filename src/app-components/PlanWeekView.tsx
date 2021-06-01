import * as React from "react";
import { usePlanWeek } from "../features/PlanWeekFeature";
import { useTranslations, useIntl } from "next-intl";
import { Menu, Transition } from "@headlessui/react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  DotsVerticalIcon,
} from "@heroicons/react/outline";
import {
  CalendarEvents,
  Family,
  Todos,
  User,
  Week,
} from "../features/DashboardFeature/Feature";
import { weekdays } from "../utils";
import { WeekTodoActivity } from "../environment/storage";

export const PlanWeekView = ({
  user,
  title,
  family,
  todos,
  events,
  week,
  previousWeek,
  onBackClick,
}: {
  user: User;
  title: string;
  family: Family;
  week: Week;
  events: CalendarEvents;
  previousWeek: Week;
  todos: Todos;
  onBackClick: () => void;
}) => {
  const [planWeek, send] = usePlanWeek();
  const t = useTranslations("PlanWeekView");
  const intl = useIntl();
  const todosList = Object.values(todos);
  const eventsList = Object.values(events);
  const userIds = Object.keys(family.users).sort((a) => {
    if (a === user.id) {
      return -1;
    }

    return 1;
  });

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <button
            onClick={onBackClick}
            className="flex-1 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="flex-2 text-lg font-medium">{title}</h1>
          <span className="flex-1" />
        </div>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
        {todosList.map((todo) => {
          return (
            <li key={todo.id} className="relative pl-4 pr-6 py-5 ">
              <div className="flex items-center">
                <span className="block">
                  <h2 className="font-medium">{todo.description}</h2>
                </span>
                <Menu as="div" className="ml-auto flex-shrink-0">
                  {({ open }) => (
                    <>
                      <Menu.Button className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        <span className="sr-only">Open options</span>
                        <DotsVerticalIcon
                          className="w-5 h-5"
                          aria-hidden="true"
                        />
                      </Menu.Button>
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
                          className="z-10 mx-3 origin-top-right absolute right-10 top-3 w-48 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none"
                        >
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    send({
                                      type: "ARCHIVE_TODO",
                                      todoId: todo.id,
                                    });
                                  }}
                                  className={`${active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                    }
                                    block px-4 py-2 text-sm`}
                                >
                                  {t("archive")}
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
                            send({
                              type: "TOGGLE_WEEKDAY",
                              active: !isActive,
                              todoId: todo.id,
                              userId,
                              weekdayIndex: index,
                            });
                          }}
                          className={`${isActive
                            ? "text-white bg-red-500"
                            : activePreviousWeek
                              ? "text-gray-700 bg-gray-200"
                              : "text-gray-700 bg-white"
                            } ${user.id === userId ? "" : "opacity-50"
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
        })}
        {eventsList.map((calendarEvent) => {
          return (
            <li
              key={calendarEvent.id}
              className="relative pl-4 pr-6 py-5"
              onClick={() => {
                send({
                  type: "TOGGLE_EVENT",
                  eventId: calendarEvent.id,
                });
              }}
            >
              <div className="flex items-center">
                <span className="block">
                  <span className="flex items-center">
                    <CalendarIcon className="text-red-600 w-4 h-4" />
                    <h4 className="text-gray-500 text-sm ml-1 mr-2">
                      {intl.formatDateTime(calendarEvent.date, {
                        day: "numeric",
                        month: "long",
                      })}
                    </h4>
                    <div className="flex flex-shrink-0 -space-x-1">
                      {calendarEvent.userIds.map((userId) => (
                        <img
                          key={userId}
                          className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                          src={family.users[userId].avatar!}
                          alt={family.users[userId].name}
                        />
                      ))}
                    </div>
                  </span>
                  <h2 className="font-medium">{calendarEvent.description}</h2>
                </span>
                <Menu as="div" className="ml-auto flex-shrink-0">
                  {({ open }) => (
                    <>
                      <Menu.Button className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        <span className="sr-only">Open options</span>
                        <DotsVerticalIcon
                          className="w-5 h-5"
                          aria-hidden="true"
                        />
                      </Menu.Button>
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
                          className="z-10 mx-3 origin-top-right absolute right-10 top-3 w-48 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none"
                        >
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    send({
                                      type: "ARCHIVE_EVENT",
                                      eventId: calendarEvent.id,
                                    });
                                  }}
                                  className={`${active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                    }
                                    block px-4 py-2 text-sm`}
                                >
                                  {t("archive")}
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
            </li>
          );
        })}
      </ul>
    </div>
  );
};
