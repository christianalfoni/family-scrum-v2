import * as React from "react";
import { weekdays } from "../../../utils";
import { use } from "impact-app";
import { useAppContext } from "../../useAppContext";
import { useWeekDinnersContext } from "./useWeekDinnersContext";
import { DinnerItem } from "./DinnerItem";

export function WeekDinners() {
  const { fetchDinners } = useAppContext();
  const { setNextWeekDinners, weekDinners } = useWeekDinnersContext();

  const dinners = use(fetchDinners());

  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
      {weekdays.map((weekday, index) => (
        <DinnerItem
          key={weekday}
          weekdayIndex={index}
          onDinnerChange={(dayIndex, dinnerId) => {
            setNextWeekDinners(dayIndex, dinnerId);
          }}
          weekday={weekday}
          dinners={dinners}
          activeDinner={weekDinners[index]}
        />
      ))}
    </ul>
  );
}
