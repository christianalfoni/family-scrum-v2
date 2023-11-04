import { context } from "impact-context";
import { useGlobalContext } from "../../../useGlobalContext";
import { useAppContext } from "../../useAppContext";
import { WeekDTO, WeekDinnersDTO } from "../../../useGlobalContext/firebase";
import { signal } from "impact-signal";

function DinnersContext({
  initialWeekDinners,
}: {
  initialWeekDinners: WeekDinnersDTO;
}) {
  const { firebase } = useGlobalContext();
  const { user, weeks } = useAppContext();

  const weeksCollection = firebase.collections.weeks(user.familyId);

  const weekDinners = signal(initialWeekDinners);

  return {
    get weekDinners() {
      return weekDinners.value;
    },
    setNextWeekDinners(dayIndex: number, dinnerId: string | null) {
      weekDinners.value = [
        ...weekDinners.value.slice(0, dayIndex),
        dinnerId,
        ...weekDinners.value.slice(dayIndex + 1),
      ] as WeekDTO["dinners"];

      firebase.setDoc(weeksCollection, {
        id: weeks.next.id,
        dinners: weekDinners.value,
      });
    },
  };
}

export const useDinnersContext = context(DinnersContext);
