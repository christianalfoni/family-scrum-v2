import { TodoDTO, WeekTodoActivityDTO } from "../../environment/Persistence";
import { weekdays } from "../../utils";
import { useFamilyScrum } from "../FamilyScrumContext";

type Props = {
  todo: TodoDTO;
};

export function TodoAssignment({ todo }: Props) {
  const { weeks, family, user } = useFamilyScrum();

  const setAssigmentsMutation = weeks.next.setAssignmentsMutation;
  const weekTodo = weeks.next.queryWeekTodo(todo.id);
  const currentWeekTodo = weeks.current.queryWeekTodo(todo.id);
  const todoAssignments = weekTodo.value?.activityByUserId ?? {};
  const currentTodoAssignments = currentWeekTodo.value?.activityByUserId ?? {};

  return Object.entries(family.users)
    .sort(([a]) => (a === user.id ? -1 : 1))
    .map(([familyUserId, familyUser]) => {
      const weekActivity =
        familyUserId === user.id &&
        setAssigmentsMutation.pendingParams &&
        todo.id === setAssigmentsMutation.pendingParams[0]
          ? setAssigmentsMutation.pendingParams[1]
          : todoAssignments[familyUserId] || [
              false,
              false,
              false,
              false,
              false,
              false,
              false,
            ];
      const previousWeekActivity = currentTodoAssignments[familyUserId] || [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ];

      return (
        <div
          key={familyUserId}
          className="flex pt-2 items-center justify-between"
        >
          <img
            className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
            src={familyUser.avatar!}
            alt={familyUser.name}
          />
          {weekActivity.map((isActive, index) => {
            const activePreviousWeek = Boolean(previousWeekActivity?.[index]);

            return (
              <button
                key={index}
                type="button"
                disabled={user.id !== familyUserId}
                onClick={() => {
                  const newWeekActivity =
                    weekActivity.slice() as WeekTodoActivityDTO;
                  newWeekActivity[index] = !isActive;
                  setAssigmentsMutation.mutate(todo.id, newWeekActivity);
                }}
                className={`${
                  isActive
                    ? "text-white bg-red-500"
                    : activePreviousWeek
                    ? "text-gray-700 bg-gray-200"
                    : "text-gray-700 bg-white"
                } ${
                  user.id === familyUserId ? "" : "opacity-50"
                } order-1 w-10 h-8 justify-center inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
              >
                {weekdays[index].substring(0, 2)}
              </button>
            );
          })}
        </div>
      );
    });
}
