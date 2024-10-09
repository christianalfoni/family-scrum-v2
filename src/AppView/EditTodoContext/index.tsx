import * as React from "react";
import { useEditTodoContext } from "./useEditTodoContext";
import { TodoDTO } from "../../useGlobalContext/firebase";
import { EditTodo } from "./EditTodo";

export function EditTodoContext({ todo }: { todo?: TodoDTO }) {
  return (
    <useEditTodoContext.Provider todo={todo}>
      <EditTodo />
    </useEditTodoContext.Provider>
  );
}
