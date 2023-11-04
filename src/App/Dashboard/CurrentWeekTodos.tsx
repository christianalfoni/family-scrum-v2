import { CalendarIcon } from "@heroicons/react/outline";
import { useTranslations, useIntl } from "next-intl";
import React, { memo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Controller } from "swiper";
import { getDayIndex, getFirstDateOfCurrentWeek, weekdays } from "../../utils";
import { addDays } from "date-fns";

import { useAppContext } from "../useAppContext";

import { WeekdaySlideContent } from "./WeekDaySlideContent";
import { useDashboardContext } from "./useDashboardContext";
import { observer, use } from "impact-signal";
import { DinnerDTO, TodoDTO } from "../../useGlobalContext/firebase";

SwiperCore.use([Controller]);

const WeekdayDinner = ({ dinner }: { dinner: DinnerDTO }) => {
  using _ = observer();

  const { getImageUrlPromise: getImageUrl } = useAppContext();
  const imageUrlPromise = getImageUrl("dinners", dinner.id);

  return (
    <li key="DINNER">
      <div className="flex items-center space-x-3 h-20">
        <div className="flex-shrink-0 h-16 w-16">
          {imageUrlPromise.status === "fulfilled" && imageUrlPromise.value ? (
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

function isTodo(todo?: TodoDTO): todo is TodoDTO {
  return Boolean(todo);
}

export const CurrentWeekTodos = memo(() => {
  using _ = observer();

  const { dinnersPromise, todosPromise, weeks, family } = useAppContext();
  const { todosByWeekday, eventsByWeekday } = useDashboardContext();

  const tCommon = useTranslations("common");
  const intl = useIntl();
  const currentDayIndex = getDayIndex();
  const currentWeekDate = getFirstDateOfCurrentWeek();
  const [slideIndex, setSlideIndex] = useState(currentDayIndex);
  const [controlledSwiper, setControlledSwiper] = useState<SwiperCore | null>(
    null,
  );
  const dinners = use(dinnersPromise);
  const currentWeek = use(weeks.current.week);
  const todos = use(todosPromise);

  return (
    <>
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
          const dinner = dinners.find((dinner) => dinner.id === dinnerId);

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
                      .map((todoId) => todos.find((todo) => todo.id === todoId))
                      .filter(isTodo)
                      .map((todo) => (
                        <li
                          key={todo.id}
                          className="py-2 flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-shrink-0 -space-x-1">
                              {weekdayTodos[todo.id].map((userId) => (
                                <img
                                  key={userId}
                                  className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                                  src={family.users[userId].avatar!}
                                  alt={family.users[userId].name}
                                />
                              ))}
                            </div>
                            <p className="ml-4 text-sm font-medium text-gray-900">
                              {todo.description}
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
    </>
  );
});
