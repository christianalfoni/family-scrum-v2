import { Suspense } from "react";
import { CurrentWeekTodos } from "./CurrentWeekTodos";
import { useCurrentWeekTodosContext } from "./useCurrentWeekTodosContext";
import { CurrentWeekTodosSkeleton } from "../Skeleton";

export function CurrentWeekTodosContext() {
  return (
    <Suspense fallback={<CurrentWeekTodosSkeleton />}>
      <useCurrentWeekTodosContext.Provider>
        <CurrentWeekTodos />
      </useCurrentWeekTodosContext.Provider>
    </Suspense>
  );
}
