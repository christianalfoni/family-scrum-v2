import {
  CalendarIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";
import { useTranslations, useIntl } from "next-intl";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Controller } from "swiper";
import { dashboardSelectors, useDasbhoard } from "../features/DashboardFeature";

import { getCurrentDayIndex, weekdays } from "../utils";
import { format } from "date-fns";

SwiperCore.use([Controller]);

const MenuCard = ({
  color,
  Icon,
  children,
  onClick,
  disabled = false,
}: {
  color: string;
  Icon: React.FC<{ className: string }>;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <li
    className="relative col-span-1 flex shadow-sm rounded-md mb-3"
    onClick={onClick}
  >
    <div
      className={`${disabled ? "bg-gray-400" : color
        } flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md`}
    >
      <Icon
        className={`${disabled ? "text-gray-200" : "text-white"} h-6 w-6`}
        aria-hidden="true"
      />
    </div>
    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
      <div
        className={`${disabled ? "text-gray-400" : "text-gray-900"
          } flex-1 px-4 py-4 text-md truncate font-medium hover:text-gray-600`}
      >
        {children}
      </div>
    </div>
  </li>
);

const WeekdaySlideContent = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="px-6">
    <h1 className="text-xl">{title}</h1>
    {children}
  </div>
);

export const DashboardContentSkeleton = () => {
  const currentDayIndex = getCurrentDayIndex();
  const t = useTranslations("DashboardView");

  return (
    <>
      <ul className="flex flex-col p-6">
        <MenuCard
          disabled
          Icon={ShoppingCartIcon}
          onClick={() => { }}
          color="bg-red-500"
        >
          {t("goShopping")} (0)
        </MenuCard>
        <MenuCard
          disabled
          Icon={ShoppingCartIcon}
          onClick={() => { }}
          color="bg-yellow-500"
        >
          {t("groceries")}
        </MenuCard>
        <MenuCard
          disabled
          Icon={CalendarIcon}
          onClick={() => { }}
          color="bg-green-500"
        >
          {t("planCurrentWeek")}
        </MenuCard>
        <MenuCard
          disabled
          Icon={CalendarIcon}
          onClick={() => { }}
          color="bg-blue-500"
        >
          {t("planNextWeek")}
        </MenuCard>
      </ul>
      <div className="h-2/4">
        <Swiper
          className="w-full h-full"
          spaceBetween={50}
          slidesPerView={1}
          allowSlideNext={false}
          allowSlidePrev={false}
          allowTouchMove={false}
          initialSlide={currentDayIndex}
        >
          {weekdays.map((weekday, index) => (
            <SwiperSlide key={weekday}>
              <WeekdaySlideContent title={t(weekdays[index]) as string}>
                {null}
              </WeekdaySlideContent>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          {weekdays.map((weekday, index) => (
            <div
              key={weekday}
              className="text-gray-500 flex items-center mx-2 w-6 h-6 text-center text-xs"
            >
              {(t(weekdays[index]) as string).substr(0, 2)}
            </div>
          ))}
          <div
            className={`text-gray-500 flex items-center mx-2 w-6 h-6 text-center text-xs`}
          >
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>
        <button
          type="button"
          disabled
          className="z-10 fixed right-3 bottom-14 h-12 w-12 rounded-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-lg text-sm font-medium  text-gray-500 bg-gray-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
    </>
  );
};

export const DashboardView = () => {
  const [dashboard, send] = useDasbhoard("LOADED");
  const t = useTranslations("DashboardView");
  const intl = useIntl();
  const { groceries, family, currentWeek, todos, events } = dashboard;
  const shopCount = Object.values(groceries).reduce(
    (aggr, grocery) => aggr + grocery.shopCount,
    0
  );
  const currentDayIndex = getCurrentDayIndex();
  const [slideIndex, setSlideIndex] = useState(currentDayIndex);
  const todosByWeekday = dashboardSelectors.todosByWeekday(currentWeek);
  const sortedEvents = dashboardSelectors.sortedEvents(events)
  const [controlledSwiper, setControlledSwiper] =
    useState<SwiperCore | null>(null);

  return (
    <>
      <ul className="flex flex-col p-6">
        <MenuCard
          disabled={!shopCount}
          Icon={ShoppingCartIcon}
          onClick={() => {
            send({
              type: "VIEW_SELECTED",
              view: {
                state: "SHOPPING_LIST",
              },
            });
          }}
          color="bg-red-500"
        >
          {t("goShopping")} ({shopCount})
        </MenuCard>
        <MenuCard
          Icon={ShoppingCartIcon}
          onClick={() => {
            send({
              type: "VIEW_SELECTED",
              view: {
                state: "GROCERIES",
              },
            });
          }}
          color="bg-yellow-500"
        >
          {t("groceries")}
        </MenuCard>
        <MenuCard
          Icon={CalendarIcon}
          onClick={() => {
            send({
              type: "VIEW_SELECTED",
              view: {
                state: "PLAN_CURRENT_WEEK",
              },
            });
          }}
          color="bg-green-500"
        >
          {t("planCurrentWeek")}
        </MenuCard>
        <MenuCard
          Icon={CalendarIcon}
          onClick={() => {
            send({
              type: "VIEW_SELECTED",
              view: {
                state: "PLAN_NEXT_WEEK",
              },
            });
          }}
          color="bg-blue-500"
        >
          {t("planNextWeek")}
        </MenuCard>
      </ul>
      <div className="h-2/4">
        <Swiper
          className="w-full h-full"
          spaceBetween={50}
          slidesPerView={1}
          onSlideChange={(swiper) => setSlideIndex(swiper.activeIndex)}
          onSwiper={setControlledSwiper}
          initialSlide={slideIndex}
        >
          {todosByWeekday.map((weekdayTodos, index) => (
            <SwiperSlide key={index}>
              <WeekdaySlideContent title={t(weekdays[index]) as string}>
                {
                  <ul className="mt-2 ">
                    {Object.keys(weekdayTodos)
                      .filter((todoId) => todoId in todos)
                      .map((todoId) => (
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
                }
              </WeekdaySlideContent>
            </SwiperSlide>
          ))}
          <SwiperSlide>
            <div className="px-6">
              <h1 className="text-xl">{t("events")}</h1>
              <ul>
                {sortedEvents.map((event) => (
                  <li
                    key={event.id}
                    className="py-3 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs leading-5 font-medium text-gray-500">
                        {intl.formatDateTime(event.date, {
                          day: "numeric",
                          month: "long",
                        })}
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
                )
                )}
              </ul>
            </div>
          </SwiperSlide>
        </Swiper>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          {weekdays.map((weekday, index) => (
            <div
              key={weekday}
              onClick={() => {
                if (controlledSwiper) {
                  controlledSwiper.slideTo(index);
                }
              }}
              className={`${index === currentDayIndex ? "text-red-500" : "text-gray-500"
                } ${index === slideIndex ? "font-bold" : ""
                } flex items-center mx-2 w-6 h-6 text-center text-xs`}
            >
              {(t(weekdays[index]) as string).substr(0, 2)}
            </div>
          ))}
          <div
            onClick={() => {
              if (controlledSwiper) {
                controlledSwiper.slideTo(7);
              }
            }}
            className={`${7 === slideIndex ? "text-gray-700" : "text-gray-500"
              } flex items-center mx-2 w-6 h-6 text-center text-xs`}
          >
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>
        <button
          type="button"
          className="z-50 fixed right-6 bottom-14 h-14 w-14 rounded-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-lg text-sm font-medium  text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <PlusIcon
            className="w-8 h-8"
            onClick={() => {
              send({
                type: "VIEW_SELECTED",
                view: {
                  state: "ADD_TODO",
                },
              });
            }}
          />
        </button>
      </div>
    </>
  );
};
