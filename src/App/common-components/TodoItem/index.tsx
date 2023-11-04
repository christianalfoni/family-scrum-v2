import * as React from "react";
import { useTranslations, useIntl } from "next-intl";
import {
  CalendarIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  ArchiveIcon,
  ChevronUpIcon,
  ClockIcon,
  TrashIcon,
} from "@heroicons/react/outline";

import { Confirmed } from "./Confirmed";
import { getDayName } from "../../../utils";
import { AddCheckListItem } from "./AddCheckListItem";
import { useTodoItemContext } from "./useTodoItemContext";
import { useGlobalContext } from "../../../useGlobalContext";
import { observer } from "impact-signal";
import { TodoDTO } from "../../../useGlobalContext/firebase";

const TodoItemContent = ({ children }: { children?: React.ReactNode }) => {
  using _ = observer();

  const t = useTranslations("CheckListsView");
  const tCommon = useTranslations("common");
  const { views } = useGlobalContext();
  const {
    todo,
    archiveTodo,
    setCheckListItemCompleted,
    addCheckListItem,
    removeCheckListItem,
  } = useTodoItemContext();
  const [isCollapsed, setCollapsed] = React.useState(true);
  const [addingCheckListItem, setAddingCheckListItem] = React.useState(false);
  const [archiving, setArchiving] = React.useState(false);
  const intl = useIntl();

  React.useEffect(() => {
    if (archiving) {
      const id = setTimeout(() => archiveTodo(), 1500);

      return () => clearTimeout(id);
    }
  }, [archiving]);

  return (
    <li key={todo.id} className="relative pl-4 pr-6 py-5 ">
      {archiving ? <Confirmed /> : null}
      {todo.date || todo.time ? (
        <div className="flex items-center text-gray-500">
          {todo.date ? (
            <span className="flex items-center text-sm mr-3">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {tCommon(getDayName(todo.date.toDate()))} -{" "}
              {intl.formatDateTime(todo.date.toDate(), {
                day: "numeric",
                month: "long",
              })}
            </span>
          ) : null}
          {todo.time ? (
            <span className="flex items-center text-sm mr-3">
              <ClockIcon className="w-4 h-4 mr-1 " />
              {todo.time}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-center">
        <span
          className="block"
          onClick={() => {
            views.push({
              name: "EDIT_TODO",
              id: todo.id,
            });
          }}
        >
          <h2 className="font-medium">{todo.description}</h2>
        </span>
        <ArchiveIcon
          className="absolute top-2 right-2 text-gray-500 w-5 h-5"
          onClick={() => {
            setArchiving(true);
          }}
        />
      </div>
      {todo.checkList ? (
        <div className=" my-2 text-sm text-gray-500 border border-gray-200 p-2 rounded-md bg-gray-50">
          <div
            className="flex items-center"
            onClick={() => setCollapsed((current) => !current)}
          >
            <ClipboardCheckIcon className="w-4 h-4 mr-1" />
            {todo.checkList.filter((item) => item.completed).length} /{" "}
            {todo.checkList.length}
            {isCollapsed ? (
              <ChevronUpIcon className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 ml-auto" />
            )}
          </div>
          {isCollapsed ? null : (
            <ul className="mt-2">
              {todo.checkList.map((item, index) => (
                <li key={index} className="flex items-center text-lg py-1 px-1">
                  <input
                    id={"checkListItem-" + index}
                    type="checkbox"
                    className="rounded text-green-500 mr-2"
                    checked={item.completed}
                    onChange={() =>
                      setCheckListItemCompleted(index, !item.completed)
                    }
                  />
                  <label htmlFor={"checkListItem-" + index} className="w-full">
                    {item.title}
                  </label>
                  <span
                    className="p-2 text-gray-300"
                    onClick={() => removeCheckListItem(index)}
                  >
                    <TrashIcon className="w-6 h-6" />
                  </span>
                </li>
              ))}
              <li>
                {addingCheckListItem ? (
                  <AddCheckListItem
                    onAdd={(title) => addCheckListItem(title)}
                  />
                ) : (
                  <div
                    className="p-2 text-gray-400 text-center text-lg"
                    onClick={() => setAddingCheckListItem(true)}
                  >
                    {t("addNewItem")}
                  </div>
                )}
              </li>
            </ul>
          )}
        </div>
      ) : null}
      {children}
    </li>
  );
};

export const TodoItem = ({
  todo,
  children,
}: {
  todo: TodoDTO;
  children?: React.ReactNode;
}) => {
  return (
    <useTodoItemContext.Provider key={todo.id} data={todo}>
      <TodoItemContent>{children}</TodoItemContent>
    </useTodoItemContext.Provider>
  );
};
