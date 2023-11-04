import React, { Suspense } from "react";
import { TodoDTO, WeekTodoDTO } from "../../../../useGlobalContext/firebase";
import { observer, use } from "impact-signal";
import { TodoItem } from "../../../common-components/TodoItem";
import { usePlanTodoItemContext } from "./usePlanTodoItemContext";
import { useAppContext } from "../../../useAppContext";
import { weekdays } from "../../../../utils";

export const PlanTodoItem = React.memo(({ todo }: { todo: TodoDTO }) => {
  const { weeks } = useAppContext();

  const nestWeekTodos = use(weeks.next.weekTodos);

  return (
    <usePlanTodoItemContext.Provider
      todoId={todo.id}
      weekTodo={nestWeekTodos[todo.id]}
    >
      <Suspense fallback={<h4>Loading...</h4>}>
        <PlanTodoItemContent todo={todo} />
      </Suspense>
    </usePlanTodoItemContext.Provider>
  );
});

export const PlanTodoItemContent = ({ todo }: { todo: TodoDTO }) => {
  using _ = observer();

  const { weeks, user } = useAppContext();
  const { activityByUserId, familyUsers, setNextWeekTodoActivity } =
    usePlanTodoItemContext();

  const currentWeekTodos = use(weeks.current.weekTodos);

  return (
    <TodoItem todo={todo}>
      {familyUsers.map((familyUser) => {
        const weekActivity = activityByUserId[familyUser.id] ?? [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ];
        const previousWeekActivity =
          currentWeekTodos[todo.id]?.activityByUserId[familyUser.id];

        return (
          <div
            key={familyUser.id}
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
                  disabled={user.id !== familyUser.id}
                  onClick={() => {
                    setNextWeekTodoActivity(index, !isActive);
                  }}
                  className={`${
                    isActive
                      ? "text-white bg-red-500"
                      : activePreviousWeek
                      ? "text-gray-700 bg-gray-200"
                      : "text-gray-700 bg-white"
                  } ${
                    user.id === familyUser.id ? "" : "opacity-50"
                  } order-1 w-10 h-8 justify-center inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  {weekdays[index].substr(0, 2)}
                </button>
              );
            })}
          </div>
        );
      })}
    </TodoItem>
  );
};
