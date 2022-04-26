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
  PlusIcon,
} from "@heroicons/react/outline";
import { getDayName } from "../../utils";
import { CheckListItemDTO, TodoDTO } from "../../environment-interface/storage";
import { useTodoItem } from "./useTodoItem";
import * as selectors from "../../selectors";
import { FamilyUserDTO } from "../../environment-interface/authentication";
import { match } from "react-states";

const Confirmed = () => (
  <div className="absolute z-10 top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-white">
    <svg
      className="checkmark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
    >
      <circle
        className="checkmark__circle"
        cx="26"
        cy="26"
        r="25"
        fill="none"
      />
      <path
        className="checkmark__check"
        fill="none"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
    </svg>
  </div>
);

export const TodoItem = React.memo(
  ({
    user,
    todo,
    checkListItems,
    children,
    onClick,
  }: {
    user: FamilyUserDTO;
    todo: TodoDTO;
    checkListItems: {
      [itemId: string]: CheckListItemDTO;
    };
    onClick: () => void;
    children?: React.ReactNode;
  }) => {
    const [state, dispatch] = useTodoItem({
      todo,
      user,
    });
    const t = useTranslations("CheckListsView");
    const tCommon = useTranslations("common");
    const [archiving, setArchiving] = React.useState(false);
    const intl = useIntl();
    const sortedCheckListItems = checkListItems
      ? selectors.sortedCheckListItems(checkListItems)
      : [];

    React.useEffect(() => {
      if (archiving) {
        const id = setTimeout(() => {
          dispatch({
            type: "ARCHIVE_TODO",
          });
        }, 1500);

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
                {tCommon(getDayName(todo.date))} -{" "}
                {intl.formatDateTime(todo.date, {
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
          <span className="block" onClick={onClick}>
            <h2 className="font-medium">{todo.description}</h2>
          </span>
          <ArchiveIcon
            className="absolute top-2 right-2 text-gray-500 w-5 h-5"
            onClick={() => {
              setArchiving(true);
            }}
          />
        </div>
        {match(state, {
          TODO: () => null,
          TODO_WITH_CHECKLIST: ({ checkList, TOGGLE_SHOW_CHECKLIST }) => (
            <div className=" my-2 text-sm text-gray-500 border border-gray-200 p-2 rounded-md bg-gray-50">
              <div
                className="flex items-center"
                onClick={() => dispatch(TOGGLE_SHOW_CHECKLIST())}
              >
                <ClipboardCheckIcon className="w-4 h-4 mr-1" />
                {
                  sortedCheckListItems.filter((item) => item.completed).length
                } / {sortedCheckListItems.length}
                {checkList.state === "COLLAPSED" ? (
                  <ChevronUpIcon className="w-4 h-4 ml-auto" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 ml-auto" />
                )}
              </div>
              {match(checkList, {
                COLLAPSED: () => null,
                EXPANDED: ({
                  addCheckListItem,
                  TOGGLE_CHECKLIST_ITEM,
                  DELETE_CHECKLIST_ITEM,
                }) => (
                  <ul className="mt-2">
                    {sortedCheckListItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center text-lg py-1 px-1"
                      >
                        <input
                          id={item.id}
                          type="checkbox"
                          className="rounded text-green-500 mr-2"
                          checked={item.completed}
                          onChange={() =>
                            dispatch(TOGGLE_CHECKLIST_ITEM(item.id))
                          }
                        />
                        <label htmlFor={item.id} className="w-full">
                          {item.title}
                        </label>
                        <span
                          className="p-2 text-gray-300"
                          onClick={() =>
                            dispatch(DELETE_CHECKLIST_ITEM(item.id))
                          }
                        >
                          <TrashIcon className="w-6 h-6" />
                        </span>
                      </li>
                    ))}
                    <li>
                      {match(addCheckListItem, {
                        INACTIVE: ({ SHOW_ADD_CHECKLIST_ITEM }) => (
                          <div
                            className="p-2 text-gray-400 text-center text-lg"
                            onClick={() => dispatch(SHOW_ADD_CHECKLIST_ITEM())}
                          >
                            {t("addNewItem")}
                          </div>
                        ),
                        ACTIVE: ({
                          newItemTitle,
                          ADD_CHECKLIST_ITEM,
                          CHANGE_NEW_CHECKLIST_ITEM_TITLE,
                        }) => (
                          <div className="flex mt-2">
                            <div className="flex-grow">
                              <input
                                autoFocus
                                type="text"
                                value={newItemTitle}
                                onChange={(event) =>
                                  dispatch(
                                    CHANGE_NEW_CHECKLIST_ITEM_TITLE(
                                      event.target.value
                                    )
                                  )
                                }
                                className="block w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
                                placeholder={`${t("title")}...`}
                                aria-describedby="add_team_members_helper"
                              />
                            </div>
                            <span className="ml-3">
                              <button
                                type="button"
                                className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                                onClick={() => dispatch(ADD_CHECKLIST_ITEM())}
                              >
                                <PlusIcon
                                  className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                                <span>{t("add")}</span>
                              </button>
                            </span>
                          </div>
                        ),
                      })}
                    </li>
                  </ul>
                ),
              })}
            </div>
          ),
        })}
        {children}
      </li>
    );
  }
);
