import { weekdays } from "../../utils";
import { useFamilyScrum } from "../FamilyScrum/useFamilyScrum";
import { DinnerAssignment } from "./DinnerAssignment";

export function PlanNextWeekDinners() {
  const familyScrum = useFamilyScrum();
  const dinners = familyScrum.dinners.dinners;
  const weekDinners = familyScrum.weeks.next.dinners;

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
          activeDinner={weekDinners[index]}
        />
      ))}
    </ul>
  );
}
