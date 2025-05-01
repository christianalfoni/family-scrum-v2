import { Todo } from "./Todo";
import { useFamilyScrum } from "./FamilyScrumContext";
import { useEffect } from "react";

export function CheckLists() {
  const { todos } = useFamilyScrum();

  useEffect(todos.subscribe, []);

  return (
    <ul className="relative z-0 divide-y divide-zinc-800 overflow-y-scroll">
      {todos.todosWithCheckList.map((todo) => (
        <Todo key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
