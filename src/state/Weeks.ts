import { reactive } from "bonsify";
import { FamilyPersistence } from "../environments/Browser/Persistence";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { FamilyScrum } from "./FamilyScrum";
import { Week } from "./Week";

export type Weeks = {
  familyScrum: FamilyScrum;
  previous: Week;
  current: Week;
  next: Week;
};

type Params = {
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrum;
  onDispose: (dispose: () => void) => void;
};

export function Weeks({
  familyScrum,
  familyPersistence,
  onDispose,
}: Params): Weeks {
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();
  const [previous, current, next] = [
    previousWeekId,
    currentWeekId,
    nextWeekId,
  ].map((weekId) =>
    Week({ weekId, familyPersistence, familyScrum, onDispose })
  );

  const weeks = reactive<Weeks>({
    familyScrum,
    previous,
    next,
    current,
  });

  return reactive.readonly(weeks);
}
