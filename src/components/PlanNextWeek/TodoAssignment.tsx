import { TodoDTO } from "../../environments/Browser/Persistence";
import { weekdays } from "../../utils";
import { useFamilyScrum } from "../FamilyScrum/useFamilyScrum";

type Props = {
  todo: TodoDTO;
};

export function TodoAssignment({ todo }: Props) {
  const familyScrum = useFamilyScrum();
  const weekTodo = familyScrum.weeks.current.todos.find(
    (weekTodo) => weekTodo.id === todo.id
  );
  const previousWeekTodo = familyScrum.weeks.previous.todos.find(
    (weekTodo) => weekTodo.id === todo.id
  );
  const todoAssignments = weekTodo?.activityByUserId ?? {};
  const previousTodoAssignments = previousWeekTodo?.activityByUserId ?? {};
  const familyUsers = Object.keys(familyScrum.family.users);

  return familyUsers.map((familyMemberId) => {
    const familyMember = familyScrum.family.users[familyMemberId];
    const weekActivity = todoAssignments[familyMemberId] ?? [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
    const previousWeekActivity = previousTodoAssignments[familyMemberId];

    return (
      <div
        key={familyMemberId}
        className="flex pt-2 items-center justify-between"
      >
        <img
          className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
          src={familyMember.avatar!}
          alt={familyMember.name}
        />
        {weekActivity.map((isActive, index) => {
          const activePreviousWeek = Boolean(previousWeekActivity?.[index]);

          return (
            <button
              key={index}
              type="button"
              disabled={familyScrum.user.id !== familyMemberId}
              onClick={() => {
                familyScrum.weeks.current.setAssignment(
                  todo.id,
                  index,
                  !isActive
                );
                todo.setAssignment(index, !isActive);
              }}
              className={`${
                isActive
                  ? "text-white bg-red-500"
                  : activePreviousWeek
                  ? "text-gray-700 bg-gray-200"
                  : "text-gray-700 bg-white"
              } ${
                todos.familyScrum.session.user.id === familyMember.id
                  ? ""
                  : "opacity-50"
              } order-1 w-10 h-8 justify-center inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              {weekdays[index].substr(0, 2)}
            </button>
          );
        })}
      </div>
    );
  });
}
