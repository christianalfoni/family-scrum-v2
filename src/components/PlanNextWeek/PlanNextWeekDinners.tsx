import * as React from "react";
import { useTranslations } from "next-intl";
import SwiperCore from "swiper";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import * as selectors from "../../selectors";
import { Swiper, SwiperSlide } from "swiper/react";
import { weekdays } from "../../utils";
import { DinnerDTO, WeekDinnersDTO } from "../../environment-interface/storage";

export const DinnerItem = ({
  weekday,
  weekdayIndex,
  dinners,
  activeDinner,
  onDinnerChange,
}: {
  weekday: string;
  weekdayIndex: number;
  dinners: Record<string, DinnerDTO>;
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
  onChangeDinner,
}: {
  weekDinners: WeekDinnersDTO;
  dinners: Record<string, DinnerDTO>;
  onChangeDinner: (weekdayIndex: number, dinnerId: string | null) => void;
}) => {
  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
      {weekdays.map((weekday, index) => (
        <DinnerItem
          key={weekday}
          weekdayIndex={index}
          onDinnerChange={onChangeDinner}
          weekday={weekday}
          dinners={dinners}
          activeDinner={weekDinners[index]}
        />
      ))}
    </ul>
  );
};
