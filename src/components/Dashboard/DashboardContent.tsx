import {
  CalendarIcon,
  ChatAlt2Icon,
  ClipboardCheckIcon,
  CollectionIcon,
  HeartIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";
import { useTranslations, useIntl } from "next-intl";
import React, { Dispatch, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Controller } from "swiper";
import { getDayIndex, getFirstDateOfCurrentWeek, weekdays } from "../../utils";
import { addDays } from "date-fns";

import * as selectors from "../../selectors";

import { getDinnerImageRef, useDinners } from "../../hooks/useDinners";
import { useGroceries } from "../../hooks/useGroceries";
import { useFamily } from "../../hooks/useFamily";
import { useTodos } from "../../hooks/useTodos";
import { useSuspendCaches } from "../../useCache";
import { useWeeks } from "../../hooks/useWeeks";
import { ViewAction } from "./useViewStack";
import { User } from "../../hooks/useCurrentUser";
import { useImage } from "../../hooks/useImage";
import { DinnerDTO } from "../../types";
import { useStore } from "impact-app";
import { ViewStackStore } from "../../stores/ViewStackStore";

SwiperCore.use([Controller]);

const WeekdayDinner = ({ dinner }: { dinner: DinnerDTO }) => {
  const imageState = useImage(getDinnerImageRef(dinner.id)).read();

  return (
    <li key="DINNER">
      <div className="flex items-center space-x-3 h-20">
        <div className="flex-shrink-0 h-16 w-16">
          {"data" in imageState ? (
            <img className="h-16 w-16 rounded" src={imageState.data} alt="" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-md font-medium text-gray-900">{dinner.name}</p>
          <p className="text-sm text-gray-500">{dinner.description}</p>
        </div>
      </div>
    </li>
  );
};

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
  <div className="px-6 h-full">
    <div className="flex items-center">
      <h1 className="text-xl">{title}</h1>
      <span className="text-md text-gray-500 ml-auto">{date}</span>
    </div>
    <div className="h-full overflow-y-scroll">
      <div className="pb-12">{children}</div>
    </div>
  </div>
);

export const DashboardSkeleton = () => {
  const t = useTranslations("DashboardView");
  const tCommon = useTranslations("common");

  return (
    <>
      <ul className="flex flex-col px-6 mb-2 mt-6">
        <MenuCard
          disabled
          Icon={CollectionIcon}
          onClick={() => {}}
          color="bg-red-500"
        >
          {t("goShopping")}
        </MenuCard>
        <MenuCard
          disabled
          Icon={CollectionIcon}
          onClick={() => {}}
          color="bg-blue-500"
        >
          {t("checkLists")}
        </MenuCard>

        <MenuCard
          disabled
          Icon={ChatAlt2Icon}
          onClick={() => {}}
          color="bg-blue-500"
        >
          {t("planNextWeek")}
        </MenuCard>
        <MenuCard
          disabled
          Icon={HeartIcon}
          onClick={() => {}}
          color="bg-blue-500"
        >
          {t("dinners")}
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

export const DashboardContent = () => {
  const viewStackStore = useStore(ViewStackStore);
  const t = useTranslations("DashboardView");
  const tCommon = useTranslations("common");
  const intl = useIntl();
  /*
  const [dinnersCache, groceriesCache, familyCache, todosCache, weeksCache] =
    useSuspendCaches([
      useDinners(user),
      useGroceries(user),
      useFamily(user),
      useTodos(user),
      useWeeks(user),
    ]);
  const currentWeek = weeksCache.read().data.currentWeek;
  const todos = todosCache.read().data;
  const groceries = groceriesCache.read().data;
  const dinners = dinnersCache.read().data;
  const family = familyCache.read().data;

  const currentDayIndex = getDayIndex();
  const currentWeekDate = getFirstDateOfCurrentWeek();
  const [slideIndex, setSlideIndex] = useState(currentDayIndex);
  const todosByWeekday = selectors.todosByWeekday(currentWeek);
  const eventsByWeekday = selectors.eventsByWeekday(todos);
  const [controlledSwiper, setControlledSwiper] = useState<SwiperCore | null>(
    null,
  );
  const shopCount = selectors.shopCount(groceries);
  const checkLists = selectors.checkLists(todos);
  */

  return (
    <>
      <ul className="flex flex-col px-6 mb-2 mt-6">
        <MenuCard
          Icon={ShoppingCartIcon}
          onClick={() => {
            viewStackStore.push({
              name: "GROCERIES_SHOPPING",
            });
          }}
          color="bg-red-500"
        >
          {t("goShopping")} ( {0} )
        </MenuCard>
        {/*
        <MenuCard
          disabled={!checkLists.length}
          Icon={ClipboardCheckIcon}
          onClick={() => {
            dispatchViewStack({
              type: "PUSH_VIEW",
              view: {
                name: "CHECKLISTS",
              },
            });
          }}
          color="bg-blue-500"
        >
          {t("checkLists")} ( {checkLists.length} )
        </MenuCard>
        <MenuCard
          Icon={ChatAlt2Icon}
          onClick={() => {
            dispatchViewStack({
              type: "PUSH_VIEW",
              view: {
                name: "PLAN_NEXT_WEEK",
                subView: "DINNERS",
              },
            });
          }}
          color="bg-green-500"
        >
          {t("planNextWeek")}
        </MenuCard>
        <MenuCard
          Icon={HeartIcon}
          onClick={() => {
            dispatchViewStack({
              type: "PUSH_VIEW",
              view: {
                name: "DINNERS",
              },
            });
          }}
          color="bg-purple-500"
        >
          {t("dinners")}
        </MenuCard>
        */}
      </ul>
      {/*
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
            const dinnerId = currentWeek.dinners[index];
            const dinner = dinnerId && dinners[dinnerId];
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
                      {dinner ? (
                        <WeekdayDinner key="WEEKDAY_DINNER" dinner={dinner} />
                      ) : null}
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
              {(tCommon(weekdays[index]) as string).substring(0, 2)}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            dispatchViewStack({
              type: "PUSH_VIEW",
              view: {
                name: "EDIT_TODO",
              },
            });
          }}
          className="z-50 fixed right-6 bottom-14 h-14 w-14 rounded-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-lg text-sm font-medium  text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
        */}
    </>
  );
};
