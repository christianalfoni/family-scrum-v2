import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronLeftIcon } from "@heroicons/react/outline";

import { TodoItem } from "../TodoItem";
import { useTodos } from "../../stores/TodosStore";
import { useViewStack } from "../../stores/ViewStackStore";
import { useCheckListItems } from "../../stores/CheckListItemsStore";

export const CheckLists = () => {
  const t = useTranslations("CheckListsView");
  const viewStack = useViewStack();
  const todos = useTodos();

  const todosList = todos.query.suspend();
  const todosWithCheckList = todosList.filter((todo) =>
    Boolean(todo.checkList),
  );

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <div className="flex-1">
            <button
              onClick={() => viewStack.pop()}
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <h1 className="flex-2 text-lg font-medium">{t("checkLists")}</h1>
          <span className="flex-1" />
        </div>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
        {todosWithCheckList.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onClick={() =>
              viewStack.push({
                name: "EDIT_TODO",
                id: todo.id,
              })
            }
          />
        ))}
      </ul>
    </div>
  );
};
