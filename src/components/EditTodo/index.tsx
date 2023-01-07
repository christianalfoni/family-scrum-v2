import * as React from "react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ClipboardCheckIcon,
  ClockIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrashIcon,
  XIcon,
} from "@heroicons/react/outline";
import { useTranslations } from "next-intl";
import { match } from "react-states";
import { format } from "date-fns";
import { useEditTodo } from "./useEditTodo";
import { TodoDTO } from "../../environment-interface/storage";
import {
  useCheckListItems,
  useCheckListItemsByTodoId,
} from "../../hooks/useCheckListItems";
import { User } from "../../hooks/useCurrentUser";

export const EditTodo = ({
  todo,
  user,
  onBackClick,
}: {
  user: User;
  todo?: TodoDTO;
  onBackClick: () => void;
}) => {
  const t = useTranslations("AddTodoView");
  const [newItemTitle, setNewItemTitle] = React.useState("");
  const checkListItems = useCheckListItems(user).suspend().read().data;
  const checkListItemsByTodoId = useCheckListItemsByTodoId(checkListItems);
  const [
    { date, description, time, grocery, validation, checkList },
    {
      CHECKLIST_TOGGLED,
      DATE_TOGGLED,
      DESCRIPTION_CHANGED,
      GROCERY_TOGGLED,
      TIME_TOGGLED,
      ADD_TODO,
      CHECKLIST_ITEM_ADDED,
      CHECKLIST_ITEM_REMOVED,
      DATE_CHANGED,
      GROCERY_NAME_CHANGED,
      TIME_CHANGED,
    },
  ] = useEditTodo({
    user,
    todo,
    checkListItemsByTodoId,
    onExit: onBackClick,
  });

  return (
    <div className="bg-white lg:min-w-0 lg:flex-1 min-h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <button
            onClick={onBackClick}
            className="flex-1 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="flex-2 text-lg font-medium">{t("addTodo")}</h1>
          <div className="flex-1 flex">
            <button
              type="submit"
              className="disabled:opacity-50 mx-autoinline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-auto"
              {...match(validation, {
                INVALID: () => ({
                  disabled: true,
                }),
                VALID: () => ({
                  onClick: () => ADD_TODO(),
                }),
              })}
            >
              {t("save")}
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <textarea
          rows={3}
          onChange={(event) => DESCRIPTION_CHANGED(event.target.value)}
          className="p-2 border-none block w-full focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Description..."
          value={description}
        />
        <div className="px-4 border-t border-gray-200  text-gray-500 text-lg font-medium ">
          {match(date, {
            ACTIVE: ({ date }) => (
              <div className="flex items-center  h-20">
                <CalendarIcon className="w-6 h-6 mr-2" />
                <input
                  className="w-full flex-1 block  bg-white py-2 pr-3 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:placeholder-gray-500 sm:text-sm"
                  type="date"
                  value={format(date, "yyyy-MM-dd")}
                  onChange={(event) =>
                    DATE_CHANGED(new Date(event.target.value).getTime())
                  }
                />
                <button
                  onClick={() => DATE_TOGGLED()}
                  className="ml-3 p-3 inline-flex items-center justify-center  text-sm font-medium rounded text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ),
            INACTIVE: () => (
              <button
                onClick={() => DATE_TOGGLED()}
                className="mx-auto inline-flex items-center  h-20 w-full"
              >
                <CalendarIcon className="w-6 h-6 mr-2" /> {t("setDate")}
              </button>
            ),
          })}
        </div>
        <div className="px-4 border-t border-gray-200 text-gray-500 text-lg font-medium ">
          {match(time, {
            ACTIVE: ({ time }) => (
              <div className="flex items-center  h-20">
                <ClockIcon className="w-6 h-6 mr-2" />
                <input
                  className="w-full flex-1 block  bg-white py-2 pr-3 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:placeholder-gray-500 sm:text-sm"
                  type="time"
                  value={time}
                  onChange={(event) => TIME_CHANGED(event.target.value)}
                />
                <button
                  onClick={() => TIME_TOGGLED()}
                  className="ml-3 p-3 inline-flex items-center justify-center  text-sm font-medium rounded text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ),
            INACTIVE: () => (
              <button
                onClick={() => TIME_TOGGLED()}
                className="mx-auto inline-flex items-center  h-20 w-full"
              >
                <ClockIcon className="w-6 h-6 mr-2" /> {t("setTime")}
              </button>
            ),
          })}
        </div>
        <div className="px-4 border-t border-gray-200 text-gray-500 text-lg font-medium ">
          {match(checkList, {
            ACTIVE: ({ items }) => (
              <div className="flex flex-col">
                <div className="flex items-center  h-20">
                  <ClipboardCheckIcon className="w-6 h-6 mr-2" />
                  <div className="flex-grow">
                    <input
                      autoFocus
                      type="text"
                      value={newItemTitle}
                      onChange={(event) => {
                        setNewItemTitle(event.target.value);
                      }}
                      className="block w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
                      placeholder={`${t("title")}...`}
                      aria-describedby="add_team_members_helper"
                    />
                  </div>
                  <span className="ml-3">
                    <button
                      type="button"
                      className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                      onClick={() => {
                        CHECKLIST_ITEM_ADDED(newItemTitle);
                        setNewItemTitle("");
                      }}
                    >
                      <PlusIcon
                        className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <span>{t("add")}</span>
                    </button>
                  </span>
                  <button
                    onClick={() => CHECKLIST_TOGGLED()}
                    className="ml-3 p-3 inline-flex items-center justify-center  text-sm font-medium rounded text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
                {items.length ? (
                  <ul className="my-2">
                    {items.map(({ title }, index) => (
                      <li
                        key={index}
                        className="flex items-center text-lg py-1 px-1"
                      >
                        <input
                          type="checkbox"
                          disabled
                          className="rounded text-green-500 mr-2 opacity-50"
                        />
                        <label className="w-full">{title}</label>
                        <span
                          className="p-2 text-gray-300"
                          onClick={() => CHECKLIST_ITEM_REMOVED(index)}
                        >
                          <TrashIcon className="w-6 h-6" />
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ),
            INACTIVE: () => (
              <button
                onClick={() => CHECKLIST_TOGGLED()}
                className="mx-auto inline-flex items-center  h-20 w-full"
              >
                <ClipboardCheckIcon className="w-6 h-6 mr-2" />{" "}
                {t("addCheckList")}
              </button>
            ),
          })}
        </div>
        <div className="px-4 border-t border-gray-200  text-gray-500 text-lg font-medium ">
          {match(grocery, {
            ACTIVE: ({ name }) => (
              <div className="flex items-center  h-20">
                <ShoppingCartIcon className="w-6 h-6 mr-2" />
                <input
                  className="w-full flex-1 block  bg-white py-2 px-3 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:placeholder-gray-500 sm:text-sm"
                  value={name}
                  onChange={(event) => GROCERY_NAME_CHANGED(event.target.value)}
                />
                <button
                  onClick={() => GROCERY_TOGGLED()}
                  className="ml-3 p-3 inline-flex items-center justify-center  text-sm font-medium rounded text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ),
            INACTIVE: () => (
              <button
                onClick={() => GROCERY_TOGGLED()}
                className="mx-auto inline-flex items-center  h-20 w-full"
              >
                <ShoppingCartIcon className="w-6 h-6 mr-2" /> {t("setGrocery")}
              </button>
            ),
          })}
        </div>
      </div>
    </div>
  );
};
