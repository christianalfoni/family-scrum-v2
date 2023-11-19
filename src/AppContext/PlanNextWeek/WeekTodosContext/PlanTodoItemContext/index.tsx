import React, { Suspense } from "react";
import { TodoDTO } from "../../../../useGlobalContext/firebase";
import { use } from "impact-app";

import { usePlanTodoItemContext } from "./usePlanTodoItemContext";
import { useAppContext } from "../../../useAppContext";
import { PlanTodoItem } from "./PlanTodoItem";

export const PlanTodoItemContext = React.memo(({ todo }: { todo: TodoDTO }) => {
  const { weeks } = useAppContext();

  const nestWeekTodos = use(weeks.next.getWeekTodos());

  return (
    <usePlanTodoItemContext.Provider
      todoId={todo.id}
      weekTodo={nestWeekTodos[todo.id]}
    >
      <Suspense fallback={<h4>Loading...</h4>}>
        <PlanTodoItem todo={todo} />
      </Suspense>
    </usePlanTodoItemContext.Provider>
  );
});
