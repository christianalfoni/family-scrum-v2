import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router";
import { Todo } from "./Todo";
import { useFamilyScrum } from "./FamilyScrumContext";
import { useEffect } from "react";
import { PageLayout } from "./common/PageLayout";

export function CheckLists() {
  const { todos } = useFamilyScrum();
  const navigate = useNavigate();

  useEffect(todos.subscribe, []);

  return (
    <PageLayout title="CheckLists">
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
        {todos.todosWithCheckList.map((todo) => (
          <Todo key={todo.id} todo={todo} />
        ))}
      </ul>
    </PageLayout>
  );
}
