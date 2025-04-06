import { reactive } from "mobx-lite";
import { FamilyPersistence } from "../environment/Persistence";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { FamilyScrumState } from "./FamilyScrumState";
import { WeekState } from "./WeekState";

export type WeeksState = ReturnType<typeof WeeksState>;

type Params = {
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrumState;
  onDispose: (dispose: () => void) => void;
};

export function WeeksState({
  familyScrum,
  familyPersistence,
  onDispose,
}: Params) {
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();
  const [previous, current, next] = [
    previousWeekId,
    currentWeekId,
    nextWeekId,
  ].map((weekId) =>
    WeekState({ weekId, familyPersistence, familyScrum, onDispose })
  );

  const weeks = reactive({
    familyScrum,
    previous,
    next,
    current,
  });

  return reactive.readonly(weeks);
}
