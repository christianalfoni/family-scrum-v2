import { useTranslations } from "next-intl";
import {
  ChatAlt2Icon,
  CollectionIcon,
  HeartIcon,
  PlusIcon,
} from "@heroicons/react/outline";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { MenuCard } from "./MenuCard";
import { weekdays } from "../../utils";
import { WeekdaySlideContent } from "./WeekDaySlideContent";

export const Skeleton = () => {
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
