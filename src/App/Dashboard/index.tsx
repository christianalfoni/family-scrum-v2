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

import { DinnerDTO } from "../../types";
import { useAppContext } from "../useAppContext";
import { useGlobalContext } from "../../useGlobalContext";
import { observer } from "impact-signal";
import { MenuCard } from "./MenuCard";

SwiperCore.use([Controller]);

const WeekdayDinner = ({ dinner }: { dinner: DinnerDTO }) => {
  const { getImageUrl } = useAppContext();
  const imageUrlPromise = getImageUrl("dinners", dinner.id);

  return (
    <li key="DINNER">
      <div className="flex items-center space-x-3 h-20">
        <div className="flex-shrink-0 h-16 w-16">
          {imageUrlPromise.status === "fulfilled" ? (
            <img
              className="h-16 w-16 rounded"
              src={imageUrlPromise.value}
              alt=""
            />
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

export const Dashboard = () => {
  using _ = observer();

  const { views } = useGlobalContext();
  const { groceries, todosWithCheckList } = useAppContext();

  // const { todos } = useTodos();
  // const dinners = useDinners();
  const t = useTranslations("DashboardView");
  const tCommon = useTranslations("common");
  const intl = useIntl();

  /*
  const checkLists = React.useMemo(
    () =>
      todos.status === "fulfilled"
        ? todos.value.filter((todo) => Boolean(todo.checkList))
        : [],
    [todos],
  );
  */
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
            views.push({
              name: "GROCERIES_SHOPPING",
            });
          }}
          color="bg-red-500"
        >
          {t("goShopping")} (
          {groceries.status === "fulfilled" ? groceries.value.length : 0})
        </MenuCard>

        <MenuCard
          disabled={!todosWithCheckList.length}
          Icon={ClipboardCheckIcon}
          onClick={() => {
            views.push({
              name: "CHECKLISTS",
            });
          }}
          color="bg-blue-500"
        >
          {t("checkLists")} ( {todosWithCheckList.length} )
        </MenuCard>

        <MenuCard
          Icon={ChatAlt2Icon}
          onClick={() => {
            views.push({
              name: "PLAN_NEXT_WEEK",
              subView: "TODOS",
            });
          }}
          color="bg-green-500"
        >
          {t("planNextWeek")}
        </MenuCard>
        {/*
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
