import { format } from "date-fns";
import React from "react";
import { useTranslations, useIntl } from "next-intl";
import { Week, dashboardSelectors } from "../features/DashboardFeature";
import {
  CalendarEvents,
  Family,
  Todos,
} from "../features/DashboardFeature/Feature";
import { getCurrentDayIndex, weekdays } from "../utils";

const Weekday = React.memo(
  ({
    weekday,
    className = "",
    children = null,
  }: {
    weekday: string;
    className?: string;
    children?: React.ReactNode;
  }) => (
    <div
      className={`${className} sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500`}
    >
      <div className="flex items-center">
        <div
          className={`${
            weekdays[getCurrentDayIndex()] === weekday
              ? "bg-red-500"
              : "bg-gray-200"
          } flex-shrink-0 w-2.5 h-2.5 rounded-full`}
          aria-hidden="true"
        />
        <h4 className="text-gray-600 ml-2 text-lg">{weekday}</h4>
      </div>
      {children}
    </div>
  )
);

const WeekdaySkeleton = React.memo(
  ({ weekday, className = "" }: { weekday: string; className?: string }) => (
    <div
      className={`${className} sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500`}
    >
      <div className="flex items-center">
        <div
          className="bg-gray-400 flex-shrink-0 w-2.5 h-2.5 rounded-full"
          aria-hidden="true"
        />
        <h4 className="text-gray-400 ml-2 text-lg">{weekday}</h4>
      </div>
    </div>
  )
);

export const WeekdaysViewSkeleton = () => {
  const t = useTranslations("WeekdaysView");

  return (
    <>
      <WeekdaySkeleton
        weekday={t("monday") as string}
        className="rounded-tl-lg"
      />
      <WeekdaySkeleton weekday={t("tuesday") as string} />
      <WeekdaySkeleton
        weekday={t("wednesday") as string}
        className="rounded-tr-lg"
      />
      <WeekdaySkeleton weekday={t("thursday") as string} />
      <WeekdaySkeleton weekday={t("friday") as string} />
      <WeekdaySkeleton weekday={t("saturday") as string} />
      <WeekdaySkeleton
        weekday={t("sunday") as string}
        className="rounded-bl-lg"
      />
      <div className="col-span-2 rounded-br-lg sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500">
        <h4 className="text-gray-400">{t("events")}</h4>
      </div>
    </>
  );
};

export const WeekdaysView = ({
  todos,
  week,
  family,
  events,
}: {
  todos: Todos;
  week: Week;
  family: Family;
  events: CalendarEvents;
}) => {
  const todosByWeekday = dashboardSelectors.todosByWeekday(week);
  const t = useTranslations("WeekdaysView");

  return (
    <>
      {todosByWeekday.map((weekdayTodos, index) => (
        <Weekday
          key={index}
          weekday={t(weekdays[index]) as string}
          className={
            [
              "rounded-tl-lg",
              undefined,
              "rounded-tr-lg",
              undefined,
              undefined,
              undefined,
              "rounded-bl-lg",
            ][index]
          }
        >
          <ul className="mt-2 ">
            {Object.keys(weekdayTodos).map((todoId) => (
              <li
                key={todoId}
                className="py-3 flex justify-between items-center"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex flex-shrink-0 -space-x-1">
                    {weekdayTodos[todoId].map((userId) => (
                      <img
                        key={userId}
                        className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                        src={family.users[userId].avatar!}
                        alt={family.users[userId].name}
                      />
                    ))}
                  </div>
                  <p className="ml-4 text-sm font-medium text-gray-900">
                    {todos[todoId].description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Weekday>
      ))}

      <div className="col-span-2 rounded-br-lg sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500">
        <h4 className="text-gray-600">{t("events")}</h4>
        <ul>
          {Object.keys(events).map((eventId) => {
            const event = events[eventId];

            return (
              <li
                key={eventId}
                className="py-3 flex justify-between items-center"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xs leading-5 font-medium">
                    {format(event.date, "dd.MM.yyyy")}
                  </span>
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

                  <p className="ml-4 text-sm font-medium text-gray-900">
                    {event.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};
