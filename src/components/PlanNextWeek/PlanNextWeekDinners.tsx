import { weekdays } from "../../utils";
import { DinnerAssignment } from "./DinnerAssignment";
import { useFamilyScrum } from "../FamilyScrumContext";

export function PlanNextWeekDinners() {
  const familyScrum = useFamilyScrum();
  const nextWeekQuery = familyScrum.weeks.next.weekQuery;
  const dinnersQuery = familyScrum.dinners.dinnersQuery;
  const dinners = dinnersQuery.value || [];
  const weekDinners = nextWeekQuery.value?.dinners || [];

  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
      {weekdays.map((weekday, index) => (
        <DinnerAssignment
          key={weekday}
          weekdayIndex={index}
          onDinnerChange={(dayIndex, dinnerId) => {
            // setNextWeekDinners(dayIndex, dinnerId);
          }}
          weekday={weekday}
          dinners={dinners}
          activeDinner={weekDinners[index] ?? null}
        />
      ))}
    </ul>
  );
}
