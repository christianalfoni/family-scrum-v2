import * as React from "react";
import { use } from "impact-app";
import { useAppContext } from "../../useAppContext";
import { useWeekDinnersContext } from "./useWeekDinnersContext";
import { WeekDinners } from "./WeekDinners";

export function WeekDinnersContext() {
  const { weeks } = useAppContext();

  const nextWeek = use(weeks.next.getWeek());

  return (
    <useWeekDinnersContext.Provider initialWeekDinners={nextWeek.dinners}>
      <WeekDinners />
    </useWeekDinnersContext.Provider>
  );
}
