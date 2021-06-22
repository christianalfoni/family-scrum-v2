import * as React from "react";
import { planWeekSelectors, usePlanWeek } from "../features/PlanWeekFeature";
import { useTranslations } from "next-intl";
import { Switch } from "@headlessui/react";
import SwiperCore from "swiper";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
} from "@heroicons/react/outline";
import {
  CheckListItemsByTodoId,
  Dinners,
  Family,
  Todos,
  User,
  Week,
} from "../features/DashboardFeature/Feature";
import { useDasbhoard } from "../features/DashboardFeature";
import { useCheckLists } from "../features/CheckListFeature";
import { Swiper, SwiperSlide } from "swiper/react";
import { weekdays } from "../utils";

/*
<SwiperSlide>
          <div className="flex items-center py-4 px-8 space-x-3">
            <div className="flex-shrink-0">
              <img className="h-16 w-16 rounded" src="dinner_1.jpeg" alt="" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-md font-medium text-gray-900">
                Awesome dinner 1
              </p>
              <p className="text-sm text-gray-500">
                Some info about the awesome dinner
              </p>
            </div>
          </div>
        </SwiperSlide>
*/
export const DinnerItem = ({
  weekday,
  dinners,
}: {
  weekday: string;
  dinners: Dinners;
}) => {
  const commonT = useTranslations("common");
  const [slideIndex, setSlideIndex] = React.useState(0);
  const [controlledSwiper, setControlledSwiper] =
    React.useState<SwiperCore | null>(null);
  const availableDinners = Object.values(dinners);

  return (
    <li className="flex flex-col">
      <div className="bg-gray-50 p-2 flex items-center border-b border-gray-200">
        {commonT(weekday)}{" "}
        {slideIndex > 0 ? (
          <Switch
            checked={false}
            onChange={() => {}}
            className={`${
              true ? "bg-gray-400" : "bg-green-500"
            } ml-auto relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-auto`}
          >
            <span
              aria-hidden="true"
              className={`
          ${false ? "translate-x-5" : "translate-x-0"}
          inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
        `}
            />
          </Switch>
        ) : null}
      </div>
      <Swiper
        className="relative w-full h-full"
        spaceBetween={50}
        slidesPerView={1}
        onSlideChange={(swiper) => setSlideIndex(swiper.activeIndex)}
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
          <SwiperSlide>
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
  dinners,
  onBackClick,
}: {
  dinners: Dinners;
  onBackClick: () => void;
}) => {
  const [, sendDashboard] = useDasbhoard("LOADED");
  const [, send] = usePlanWeek();
  const [, sendTodos] = useCheckLists();
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
              onClick={() => {
                sendDashboard({
                  type: "VIEW_SELECTED",
                  view: {
                    state: "PLAN_NEXT_WEEK_TODOS",
                  },
                });
              }}
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
        {weekdays.map((weekday) => (
          <DinnerItem key={weekday} weekday={weekday} dinners={dinners} />
        ))}
      </ul>
    </div>
  );
};
