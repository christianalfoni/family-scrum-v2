import React from "react";
import {
  CheckListItemDTO,
  FamilyDTO,
  TodoDTO,
  UserDTO,
  WeekDTO,
  WeekTodoDTO,
} from "../../stores/FirebaseStore";
import { TodoItem } from "../TodoItem";
import { observer } from "impact-app";
import { useFamily } from "../../stores/FamilyStore";

export const PlanTodoItem = React.memo(({ todo }: { todo: TodoDTO }) => {
  using _ = observer();
  const { familyUsers } = useFamily();

  return (
    <TodoItem todo={todo} onClick={() => onClick(todo.id)}>
      {familyUsers.map((familyUser) => {
        const weekActivity = weekTodos[todo.id]?.[familyUser.id] ?? [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ];
        const previousWeekActivity = previousWeek.todos[todo.id]?.[userId];

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
                  disabled={user.id !== userId}
                  onClick={() => {
                    toggleWeekday({
                      active: !isActive,
                      todoId: todo.id,
                      userId,
                      weekdayIndex: index,
                    });
                  }}
                  className={`${
                    isActive
                      ? "text-white bg-red-500"
                      : activePreviousWeek
                      ? "text-gray-700 bg-gray-200"
                      : "text-gray-700 bg-white"
                  } ${
                    user.id === userId ? "" : "opacity-50"
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
});
