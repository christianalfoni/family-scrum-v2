import { CalendarIcon } from "@heroicons/react/24/solid";
import { Suspense, use, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Controller } from "swiper/modules";
import {
  getWeekDayIndex,
  getFirstDateOfCurrentWeek,
  weekdays,
} from "../../utils";
import * as state from "../../state";

import { WeekdaySlideContent } from "./WeekDaySlideContent";

function DinnerImage({ imageUrl }: { imageUrl: Promise<string> }) {
  const src = use(imageUrl);

  return <img className="h-16 w-16 rounded" src={src} alt="" />;
}

function WeekdayDinner({ dinner }: { dinner: state.Dinner }) {
  return (
    <li key="DINNER">
      <div className="flex items-center space-x-3 h-20">
        <div className="flex-shrink-0 h-16 w-16">
          {dinner.imageUrl ? (
            <Suspense>
              <DinnerImage imageUrl={dinner.imageUrl} />
            </Suspense>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-md font-medium text-gray-900">{dinner.name}</p>
          <p className="text-sm text-gray-500">{dinner.description}</p>
        </div>
      </div>
    </li>
  );
}

type Props = {
  familyScrum: state.FamilyScrum;
};

export function CurrentWeekCalendar({ familyScrum }: Props) {
  const currentDayIndex = getWeekDayIndex();
  const currentWeekDate = getFirstDateOfCurrentWeek();
  const [slideIndex, setSlideIndex] = useState(currentDayIndex);
  const [controlledSwiper, setControlledSwiper] = useState<any>(null);

  return (
    <>
      <Swiper
        className="w-full h-full"
        modules={[Controller]}
        spaceBetween={50}
        slidesPerView={1}
        onSlideChange={(swiper) => setSlideIndex(swiper.activeIndex)}
        onSwiper={setControlledSwiper}
        initialSlide={slideIndex}
      >
        {familyScrum.weekEntries.map((weekEntry, index) => {
          return (
            <SwiperSlide key={index}>
              <WeekdaySlideContent
                title={weekdays[index]}
                date={currentWeekDate.toLocaleDateString()}
              >
                {
                  <ul className="mt-2 ">
                    {weekEntry.dinner ? (
                      <WeekdayDinner
                        key="WEEKDAY_DINNER"
                        dinner={weekEntry.dinner}
                      />
                    ) : null}
                    {weekEntry.entries.map((weekEntry) => {
                      const todo = weekEntry.todo;

                      if (weekEntry.type === "event") {
                        return (
                          <li
                            key={weekEntry.todo.id}
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
                        );
                      }

                      return (
                        <li
                          key={todo.id}
                          className="py-2 flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-shrink-0 -space-x-1">
                              {weekEntry.assignedTo.map((familyUser) => (
                                <img
                                  key={familyUser.name}
                                  className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                                  src={familyUser.avatar!}
                                  alt={familyUser.name}
                                />
                              ))}
                            </div>
                            <p className="ml-4 text-sm font-medium text-gray-900">
                              {todo.description}
                            </p>
                          </div>
                        </li>
                      );
                    })}
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
            {weekdays[index].substring(0, 2)}
          </div>
        ))}
      </div>
    </>
  );
}
