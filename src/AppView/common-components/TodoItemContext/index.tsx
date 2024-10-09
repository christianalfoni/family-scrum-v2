import * as React from "react";

import { useTodoItemContext } from "./useTodoItemContext";
import { TodoDTO } from "../../../useGlobalContext/firebase";
import { TodoItem } from "./TodoItem";

export const TodoItemContext = ({
  todo,
  children,
}: {
  todo: TodoDTO;
  children?: React.ReactNode;
}) => {
  return (
    <useTodoItemContext.Provider todo={todo}>
      <TodoItem>{children}</TodoItem>
    </useTodoItemContext.Provider>
  );
};
