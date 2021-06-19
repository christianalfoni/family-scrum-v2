import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronLeftIcon } from "@heroicons/react/outline";
import {
  CheckListItemsByTodoId,
  Todos,
} from "../features/DashboardFeature/Feature";
import { dashboardSelectors } from "../features/DashboardFeature";
import {
  checkListSelectors,
  useCheckLists,
} from "../features/CheckListFeature";
import { TodoItem } from "../common-components/TodoItem";

export const CheckListsView = ({
  todos,
  checkListItemsByTodoId,
  onBackClick,
}: {
  todos: Todos;
  checkListItemsByTodoId: CheckListItemsByTodoId;
  onBackClick: () => void;
}) => {
  const [, send] = useCheckLists();
  const t = useTranslations("CheckListsView");
  const checkLists = checkListSelectors.checkLists(todos);
  const archiveTodo = React.useCallback((todoId: string) => {
    send({
      type: "ARCHIVE_TODO",
      todoId,
    });
  }, []);
  const toggleItemCompleted = React.useCallback((itemId: string) => {
    send({
      type: "TOGGLE_CHECKLIST_ITEM",
      itemId,
    });
  }, []);
  const deleteItem = React.useCallback((itemId: string) => {
    send({
      type: "DELETE_CHECKLIST_ITEM",
      itemId,
    });
  }, []);
  const addItem = React.useCallback((todoId: string, title: string) => {
    send({
      type: "ADD_CHECKLIST_ITEM",
      todoId,
      title,
    });
  }, []);

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <div className="flex-1">
            <button
              onClick={onBackClick}
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
        {checkLists.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            archiveTodo={archiveTodo}
            checkListItems={checkListItemsByTodoId[todo.id]}
            toggleItemCompleted={toggleItemCompleted}
            deleteItem={deleteItem}
            addItem={addItem}
          />
        ))}
      </ul>
    </div>
  );
};
