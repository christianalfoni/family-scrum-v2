import * as React from "react";
import { useTranslations } from "next-intl";
import { Switch } from "@headlessui/react";
import SwiperCore from "swiper";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
} from "@heroicons/react/outline";
import { Dinners, selectors } from "../features/DashboardFeature/Feature";
import { Swiper, SwiperSlide } from "swiper/react";
import { weekdays } from "../utils";
import { WeekDinnersDTO } from "../environment-interface/storage";
import { usePlanWeek } from "../features/PlanWeekFeature";

export const DinnerItem = ({
  weekday,
  weekdayIndex,
  dinners,
  activeDinner,
  onDinnerChange,
}: {
  weekday: string;
  weekdayIndex: number;
  dinners: Dinners;
  activeDinner: string | null;
  onDinnerChange: (dayIndex: number, dinnerId: string | null) => void;
}) => {
  const availableDinners = selectors.sortedDinners(dinners);
  const activeDinnerIndex = availableDinners.findIndex(
    (dinner) => dinner.id === activeDinner
  );
  const commonT = useTranslations("common");
  const [slideIndex, setSlideIndex] = React.useState(
    activeDinnerIndex === -1 ? 0 : activeDinnerIndex + 1
  );
  const [controlledSwiper, setControlledSwiper] =
    React.useState<SwiperCore | null>(null);

  return (
    <li className="flex flex-col">
      <div className="bg-gray-50 p-2 flex items-center border-b border-gray-200">
        {commonT(weekday)}{" "}
      </div>
      <Swiper
        className="relative w-full h-full"
        spaceBetween={50}
        slidesPerView={1}
        onSlideChange={(swiper) => {
          setSlideIndex(swiper.activeIndex);
          onDinnerChange(
            weekdayIndex,
            swiper.activeIndex === 0
              ? null
              : availableDinners[swiper.activeIndex - 1].id
          );
        }}
        onSwiper={setControlledSwiper}
        initialSlide={slideIndex}
      >
        <SwiperSlide>
          <div className="flex items-center flex-col py-4 px-8 h-24 bg-gray-100 justify-center text-gray-500">
            <div>
              You have{" "}
              <span className="font-bold">{availableDinners.length}</span>{" "}
              recipes
            </div>
            <div className="text-sm">Tap to add more</div>
          </div>
        </SwiperSlide>
        {availableDinners.map((dinner) => (
          <SwiperSlide key={dinner.id}>
            <div className="flex items-center py-4 px-8 space-x-3 h-24">
              <div className="flex-shrink-0">
                <img className="h-16 w-16 rounded" src="dinner_1.jpeg" alt="" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-md font-medium text-gray-900">
                  {dinner.name}
                </p>
                <p className="text-sm text-gray-500">{dinner.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div
          className="absolute h-full left-0 top-0 flex items-center justify-center w-6 z-10"
          onClick={() => {
            controlledSwiper?.slidePrev();
          }}
        >
          <ChevronLeftIcon
            className="h-6 w-6 text-gray-300"
            aria-hidden="true"
          />
        </div>
        <div
          className="absolute h-full right-0 top-0 flex items-center justify-center w-6 z-10"
          onClick={() => {
            controlledSwiper?.slideNext();
          }}
        >
          <ChevronRightIcon
            className="h-6 w-6 text-gray-300"
            aria-hidden="true"
          />
        </div>
      </Swiper>
    </li>
  );
};

export const PlanNextWeekDinners = ({
  weekDinners,
  dinners,
  onBackClick,
  onClickPlanNextWeekTodos,
}: {
  weekDinners: WeekDinnersDTO;
  dinners: Dinners;
  onBackClick: () => void;
  onClickPlanNextWeekTodos: () => void;
}) => {
  const [, dispatch] = usePlanWeek();
  const t = useTranslations("PlanWeekView");

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

          <div className="flex shadow-sm  flex-2">
            <button
              type="button"
              className="flex-1 relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <HeartIcon
                className="mr-1 h-5 w-5 text-red-400"
                aria-hidden="true"
              />
              <span>{t("dinners")}</span>
            </button>
            <button
              type="button"
              onClick={onClickPlanNextWeekTodos}
              className="flex-1 inline-flex -ml-px relative items-center px-4 py-2 rounded-r-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <CheckCircleIcon
                className="mr-1 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <span>{t("todos")}</span>
            </button>
          </div>

          <span className="flex-1" />
        </div>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
        {weekdays.map((weekday, index) => (
          <DinnerItem
            key={weekday}
            weekdayIndex={index}
            onDinnerChange={(weekdayIndex, dinnerId) => {
              dispatch({
                type: "CHANGE_WEEKDAY_DINNER",
                dinnerId,
                weekdayIndex,
              });
            }}
            weekday={weekday}
            dinners={dinners}
            activeDinner={weekDinners[index]}
          />
        ))}
      </ul>
    </div>
  );
};
