import { weekdays } from "../../utils";
import { DinnerAssignment } from "./DinnerAssignment";
import { FamilyScrumState } from "../../state/FamilyScrumState";

type Props = {
  familyScrum: FamilyScrumState;
};

export function PlanNextWeekDinners({ familyScrum }: Props) {
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
          activeDinner={
            weekDinners.find((dinner) => dinner.weekDay === index)?.id ?? null
          }
        />
      ))}
    </ul>
  );
}
