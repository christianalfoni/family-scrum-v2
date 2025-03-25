import { reactive } from "bonsify";
import {
  FamilyPersistence,
  WeekDTO,
} from "../../environments/Browser/Persistence";

export type Week = WeekDTO;

type Params = {
  data: WeekDTO;
  familyPersistence: FamilyPersistence;
  onDispose: (dispose: () => void) => void;
};

export function Week({ data, familyPersistence, onDispose }: Params) {
  const week = reactive<Week>(data);

  onDispose(familyPersistence.weeks.subscribe(data.id, updateWeek));

  return week;

  function updateWeek(data: WeekDTO) {
    week.dinners = data.dinners;
  }
}
