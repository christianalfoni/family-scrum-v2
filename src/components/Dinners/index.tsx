import React, { Dispatch } from "react";
import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/outline";
import * as selectors from "../../selectors";
import { DinnerDTO } from "../../environment-interface/storage";
import { useImage } from "../../useImage";
import { useEnvironment } from "../../environment-interface";
import {
  DashboardAction,
  DashboardState,
  viewStates,
} from "../Dashboard/useDashboard";
import { PickState } from "react-states";
import { useTranslations } from "next-intl";

const Dinner = ({
  dinner,
  onClick,
}: {
  dinner: DinnerDTO;
  onClick: (id: string) => void;
}) => {
  const { storage } = useEnvironment();
  const [imageState] = useImage({
    ref: storage.getDinnerImageRef(dinner.id),
  });

  return (
    <li
      key={dinner.id}
      onClick={() => {
        onClick(dinner.id);
      }}
    >
      <div className="flex items-center py-4 px-8 space-x-3 h-24">
        <div className="flex-shrink-0 h-16 w-16">
          {imageState.state === "LOADED" ? (
            <img className="h-16 w-16 rounded" src={imageState.src} alt="" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-md font-medium text-gray-900">{dinner.name}</p>
          <p className="text-sm text-gray-500">{dinner.description}</p>
        </div>
      </div>
    </li>
  );
};

export const Dinners = ({
  dashboard,
}: {
  dashboard: [PickState<DashboardState, "LOADED">, Dispatch<DashboardAction>];
}) => {
  const [{ data, POP_VIEW, PUSH_VIEW }, dispatch] = dashboard;
  const sortedDinners = selectors.sortedDinners(data.dinners);
  const t = useTranslations("DinnersView");

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <div className="flex-1">
            <button
              onClick={() => dispatch(POP_VIEW())}
              className=" bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <h1 className="flex-2 text-lg font-medium">{t('dinners')}</h1>
          <div className="flex-1 flex">
            <button
              className="ml-auto"
              onClick={() => dispatch(PUSH_VIEW(viewStates.EDIT_DINNER()))}
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      {sortedDinners.length ? (
        <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
          {sortedDinners.map((dinner) => (
            <Dinner
              key={dinner.id}
              dinner={dinner}
              onClick={(id) => dispatch(PUSH_VIEW(viewStates.EDIT_DINNER(id)))}
            />
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-full">
          <a
            onClick={() => dispatch(PUSH_VIEW(viewStates.EDIT_DINNER()))}
            className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            New Dinner
          </a>
        </div>
      )}
    </div>
  );
};
