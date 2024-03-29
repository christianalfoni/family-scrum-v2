import * as React from "react";
import { useTranslations } from "next-intl";
import SwiperCore from "swiper";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAppContext } from "../../useAppContext";
import { DinnerDTO } from "../../../useGlobalContext/firebase";

function DinnerSlide({ dinner }: { dinner: DinnerDTO }) {
  const { fetchImageUrl } = useAppContext();
  const image = fetchImageUrl("dinners", dinner.id);

  return (
    <div className="flex items-center py-4 px-8 space-x-3 h-24">
      <div className="flex-shrink-0 h-16 w-16">
        {image.status === "fulfilled" && image.value ? (
          <img className="h-16 w-16 rounded" src={image.value} alt="" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-md font-medium text-gray-900">{dinner.name}</p>
        <p className="text-sm text-gray-500">{dinner.description}</p>
      </div>
    </div>
  );
}

export function DinnerItem({
  weekday,
  weekdayIndex,
  dinners,
  activeDinner,
  onDinnerChange,
}: {
  weekday: string;
  weekdayIndex: number;
  dinners: DinnerDTO[];
  activeDinner: string | null;
  onDinnerChange: (dayIndex: number, dinnerId: string | null) => void;
}) {
  const activeDinnerIndex = dinners.findIndex(
    (dinner) => dinner.id === activeDinner,
  );
  const commonT = useTranslations("common");
  const [slideIndex, setSlideIndex] = React.useState(
    activeDinnerIndex === -1 ? 0 : activeDinnerIndex + 1,
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
              : dinners[swiper.activeIndex - 1].id,
          );
        }}
        onSwiper={setControlledSwiper}
        initialSlide={slideIndex}
      >
        <SwiperSlide>
          <div className="flex items-center flex-col py-4 px-8 h-24 bg-gray-100 justify-center text-gray-500">
            <div>
              You have <span className="font-bold">{dinners.length}</span>{" "}
              recipes
            </div>
            <div className="text-sm">Tap to add more</div>
          </div>
        </SwiperSlide>
        {dinners.map((dinner) => (
          <SwiperSlide key={dinner.id}>
            <DinnerSlide dinner={dinner} />
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
}
