import {
  CalendarIcon,
  ChatAlt2Icon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  CollectionIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";
import { useTranslations, useIntl } from "next-intl";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Controller } from "swiper";
import { dashboardSelectors, useDasbhoard } from "../features/DashboardFeature";
import { getDayIndex, getFirstDateOfCurrentWeek, weekdays } from "../utils";
import { groceriesShoppingSelectors } from "../features/GroceriesShoppingFeature";
import { addDays, format, isSameDay } from "date-fns";
import { checkListSelectors } from "../features/CheckListFeature";

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
      className={`${
        disabled ? "bg-gray-400" : color
      } flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md`}
    >
      <Icon
        className={`${disabled ? "text-gray-200" : "text-white"} h-6 w-6`}
        aria-hidden="true"
      />
    </div>
    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
      <div
        className={`${
          disabled ? "text-gray-400" : "text-gray-900"
        } flex-1 px-4 py-4 text-md truncate font-medium hover:text-gray-600`}
      >
        {children}
      </div>
    </div>
  </li>
);

const WeekdaySlideContent = ({
  title,
  date,
  children,
}: {
  title: string;
  date: string;
  children: React.ReactNode;
}) => (
  <div className="px-6">
    <div className="flex items-center">
      <h1 className="text-xl">{title}</h1>
      <span className="text-md text-gray-500 ml-auto">{date}</span>
    </div>
    {children}
  </div>
);

export const DashboardContentSkeleton = () => {
  const t = useTranslations("DashboardView");
  const tCommon = useTranslations("common");

  return (
    <>
      <div className="flex p-6 items-center">
        <button className="p-2 border-2 border-gray-300 rounded flex text-gray-500 text-sm flex-1 mr-1 items-center">
          <ShoppingCartIcon className="w-6 h-6 mr-1" /> {t("goShopping")}{" "}
          <span className="ml-auto">0</span>
        </button>
        <button className="p-2 border-2 border-gray-300 rounded flex text-gray-500 text-sm flex-1 ml-1 items-center">
          <ClipboardCheckIcon className="w-6 h-6 mr-1" /> {t("checkLists")}{" "}
          <span className="ml-auto">0</span>
        </button>
      </div>

      <ul className="flex flex-col px-6">
        <MenuCard
          disabled
          Icon={CollectionIcon}
          onClick={() => {}}
          color="bg-yellow-500"
        >
          {t("groceries")}
        </MenuCard>

        <MenuCard
          disabled
          Icon={ChatAlt2Icon}
          onClick={() => {}}
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
          initialSlide={0}
        >
          {weekdays.map((weekday, index) => (
            <SwiperSlide key={weekday}>
              {/* No title as server side caches this page */}
              <WeekdaySlideContent title="" date="">
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
              {(tCommon(weekdays[index]) as string).substr(0, 2)}
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled
          className="z-10 fixed right-6 bottom-14 h-14 w-14 rounded-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-lg text-sm font-medium  text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
  const tCommon = useTranslations("common");
  const intl = useIntl();
  const { groceries, family, currentWeek, todos } = dashboard;
  const currentDayIndex = getDayIndex();
  const currentWeekDate = getFirstDateOfCurrentWeek();
  const [slideIndex, setSlideIndex] = useState(currentDayIndex);
  const todosByWeekday = dashboardSelectors.todosByWeekday(currentWeek);
  const eventsByWeekday = dashboardSelectors.eventsByWeekday(todos);
  const [controlledSwiper, setControlledSwiper] =
    useState<SwiperCore | null>(null);
  const shopCount = groceriesShoppingSelectors.shopCount(groceries);
  const checkLists = checkListSelectors.checkLists(todos);

  return (
    <>
      <div className="flex p-6 items-center">
        <button
          disabled={!shopCount}
          onClick={() => {
            send({
              type: "VIEW_SELECTED",
              view: {
                state: "GROCERIES_SHOPPING",
              },
            });
          }}
          className={`${
            shopCount
              ? "border-red-500 bg-white text-black"
              : "border-gray-300 text-gray-400"
          } p-2 border-2  rounded flex  text-sm flex-1 mr-1 items-center`}
        >
          <ShoppingCartIcon
            className={`${
              shopCount ? "text-red-500" : "text-gray-400"
            } w-6 h-6 mr-1`}
          />{" "}
          {t("goShopping")}{" "}
          <span className="ml-auto text-gray-400">{shopCount}</span>
        </button>
        <button
          onClick={() => {
            send({
              type: "VIEW_SELECTED",
              view: {
                state: "CHECKLISTS",
              },
            });
          }}
          className={`${
            checkLists.length
              ? "border-blue-500 bg-white text-black"
              : "border-gray-300 text-gray-400"
          } p-2 border-2  rounded flex  text-sm flex-1 ml-1 items-center`}
        >
          <ClipboardCheckIcon
            className={`${
              shopCount ? "text-blue-500" : "text-gray-400"
            } w-6 h-6 mr-1`}
          />{" "}
          {t("checkLists")}
          <span className="ml-auto text-gray-400">{checkLists.length}</span>
        </button>
      </div>
      <ul className="flex flex-col px-6">
        <MenuCard
          Icon={CollectionIcon}
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
          Icon={ChatAlt2Icon}
          onClick={() => {
            send({
              type: "VIEW_SELECTED",
              view: {
                state: "PLAN_NEXT_WEEK",
              },
            });
          }}
          color="bg-green-500"
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
          {todosByWeekday.map((weekdayTodos, index) => {
            return (
              <SwiperSlide key={index}>
                <WeekdaySlideContent
                  title={`${tCommon(weekdays[index])}`}
                  date={intl.formatDateTime(addDays(currentWeekDate, index), {
                    day: "numeric",
                    month: "long",
                  })}
                >
                  {
                    <ul className="mt-2 ">
                      {eventsByWeekday[index].map((todo) => (
                        <li
                          key={todo.id}
                          className="py-2 flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-shrink-0 -space-x-1">
                              <CalendarIcon className="w-4 h-4 text-red-500" />
                            </div>
                            {todo.time ? (
                              <span className="text-sm text-gray-500">
                                {todo.time}
                              </span>
                            ) : null}

                            <p className="ml-4 text-sm font-medium text-gray-900">
                              {todo.description}
                            </p>
                          </div>
                        </li>
                      ))}
                      {Object.keys(weekdayTodos)
                        .filter((todoId) => todoId in todos)
                        .map((todoId) => (
                          <li
                            key={todoId}
                            className="py-2 flex justify-between items-center"
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
            );
          })}
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
              className={`${
                index === currentDayIndex ? "text-red-500" : "text-gray-500"
              } ${
                index === slideIndex ? "font-bold" : ""
              } flex items-center mx-2 w-6 h-6 text-center text-xs`}
            >
              {(tCommon(weekdays[index]) as string).substr(0, 2)}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            send({
              type: "VIEW_SELECTED",
              view: {
                state: "ADD_TODO",
              },
            });
          }}
          className="z-50 fixed right-6 bottom-14 h-14 w-14 rounded-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-lg text-sm font-medium  text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
    </>
  );
};
