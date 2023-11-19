import * as React from "react";

import { useWeekTodosContext } from "./useWeekTodosContext";
import { WeekTodos } from "./WeekTodos";

export function WeekTodosContext() {
  return (
    <useWeekTodosContext.Provider>
      <WeekTodos />
    </useWeekTodosContext.Provider>
  );
}
