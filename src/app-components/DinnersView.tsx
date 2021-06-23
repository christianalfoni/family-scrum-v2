import React from "react";
import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/outline";
import { useDasbhoard } from "../features/DashboardFeature";

export const DinnersView = ({ onBackClick }: { onBackClick: () => void }) => {
  const [, send] = useDasbhoard("LOADED");

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <div className="flex-1">
            <button
              onClick={onBackClick}
              className=" bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <h1 className="flex-2 text-lg font-medium">Dinners</h1>
          <div className="flex-1 flex">
            <button
              className="ml-auto"
              onClick={() => {
                send({
                  type: "VIEW_SELECTED",
                  view: {
                    state: "ADD_DINNER",
                  },
                });
              }}
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      {false ? (
        <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll"></ul>
      ) : (
        <div className="flex items-center justify-center h-full">
          <a
            onClick={() => {
              send({
                type: "VIEW_SELECTED",
                view: {
                  state: "ADD_DINNER",
                },
              });
            }}
            className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            New Dinner
          </a>
        </div>
      )}
    </div>
  );
};
