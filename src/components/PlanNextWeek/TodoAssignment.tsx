import { weekdays } from "../../utils";
import * as state from "../../state";

type Props = {
  todo: state.Todo;
  todos: state.Todos;
  week: state.Week;
  previousWeek: state.Week;
};

export function TodoAssignment({ todo, week, previousWeek, todos }: Props) {
  console.log("RENDER ASSIGNMENT");
  const weekTodo = week.todos.find((weekTodo) => weekTodo.id === todo.id);
  const todoAssignments = weekTodo?.assignments ?? [];
  const previousTodoAssignments =
    previousWeek.todos.find((weekTodo) => weekTodo.id === todo.id)
      ?.assignments ?? [];

  return todos.familyScrum.session.family.members.map((familyMember) => {
    const weekActivity = todoAssignments.find(
      (assignment) => assignment.familyMember.id === familyMember.id
    )?.activity ?? [false, false, false, false, false, false, false];
    const previousWeekActivity = previousTodoAssignments.find(
      (assignment) => assignment.familyMember.id === familyMember.id
    )?.activity;

    return (
      <div
        key={familyMember.id}
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
              disabled={todos.familyScrum.session.user.id !== familyMember.id}
              onClick={() => {
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
