import { reactive } from "mobx-lite";
import { FamilyPersistence } from "../environment/Persistence";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { WeekState } from "./WeekState";

type Params = {
  familyPersistence: FamilyPersistence;
};

export function WeeksState({ familyPersistence }: Params) {
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();
  const [previous, current, next] = [
    previousWeekId,
    currentWeekId,
    nextWeekId,
  ].map((weekId) => WeekState({ weekId, familyPersistence }));

  const weeks = reactive({
    previous,
    next,
    current,
  });

  return reactive.readonly(weeks);
}
