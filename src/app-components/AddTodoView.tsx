import * as React from "react";
import { ChevronLeftIcon, XIcon } from "@heroicons/react/outline";
import { useTranslations } from "next-intl";
import { useAddTodo } from "../features/AddTodoFeature";
import { match } from "react-states";
import { format } from "date-fns";

export const AddTodoView = ({ onBackClick }: { onBackClick: () => void }) => {
  const [addTodo, send] = useAddTodo();
  const t = useTranslations("AddTodoView");

  return (
    <>
      <div className="bg-white lg:min-w-0 lg:flex-1">
        <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
          <div className="flex items-center">
            <button
              onClick={onBackClick}
              className="flex-1 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="flex-2 text-lg font-medium">{t("addTodo")}</h1>
            <span className="flex-1" />
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col">
        <textarea
          rows={3}
          onChange={(event) => {
            send({
              type: "DESCRIPTION_CHANGED",
              description: event.target.value,
            });
          }}
          className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
          placeholder="Description"
          value={addTodo.description}
        />
        <div className="h-24 flex items-center justify-center">
          {match(addTodo, {
            DEFINING_EVENT: ({ date }) => (
              <div className="flex">
                <input
                  className="w-full flex-1 block  bg-white py-2 pr-3 border border-gray-300 rounded-l-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:placeholder-gray-500 sm:text-sm"
                  type="date"
                  value={format(date, "yyyy-MM-dd")}
                  onChange={(event) => {
                    send({
                      type: "DATE_CHANGED",
                      date: new Date(event.target.value).getTime(),
                    });
                  }}
                />
                <button
                  onClick={() => {
                    send({
                      type: "CANCEL_DATE",
                    });
                  }}
                  className="flex-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium  border-gray-300 rounded-r-md shadow-sm text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ),
            DEFINING_TODO: () => (
              <button
                onClick={() => {
                  send({
                    type: "ADD_DATE",
                  });
                }}
                className="text-gray-500 mx-auto inline-flex items-center justify-center px-4 py-2 text-lg font-medium "
              >
                {t("setDate")}
              </button>
            ),
          })}
        </div>
        <button
          type="submit"
          disabled={match(addTodo.validation, {
            INVALID: () => true,
            VALID: () => false,
          })}
          onClick={() => {
            match(addTodo, {
              DEFINING_EVENT: () =>
                send({
                  type: "ADD_EVENT",
                }),
              DEFINING_TODO: () =>
                send({
                  type: "ADD_TODO",
                }),
            });
          }}
          className="disabled:opacity-50 mx-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {t("save")}
        </button>
      </div>
    </>
  );
};
