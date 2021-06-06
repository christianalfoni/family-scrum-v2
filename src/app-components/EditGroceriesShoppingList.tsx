import * as React from "react";
import { useTranslations } from "next-intl";
import { useDasbhoard } from "../features/DashboardFeature";
import {

  PlusIcon,
  SearchIcon,
} from "@heroicons/react/outline";

import { useEditGroceriesShopping } from "../features/EditGroceriesShoppingFeature";
import { match } from "react-states";

import { GroceriesList } from "../common-components/GroceriesList";

export const EditGroceriesShoppingList = () => {
  const [dashboardFeature] = useDasbhoard('LOADED')
  const [groceriesFeature, send] = useEditGroceriesShopping();
  const t = useTranslations("GroceriesView");
  const { groceries, barcodes } = dashboardFeature

  return (
    <>
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="w-full">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <SearchIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              id="search"
              name="search"
              value={match(groceriesFeature, {
                FILTERED: ({ input }) => input,
                UNFILTERED: () => ''
              })}
              onChange={(event) => {
                send({
                  type: "GROCERY_INPUT_CHANGED",
                  input: event.target.value,
                });
              }}
              className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
              placeholder={t("filterNewGrocery") as string}
              type="search"
            />
          </div>
        </div>
        <span className="ml-3">
          <button
            type="button"
            disabled={match(groceriesFeature, {
              UNFILTERED: () => true,
              FILTERED: ({ input }) => (input ? false : true),
            })}
            onClick={() => {
              send({
                type: "ADD_GROCERY",
              });
            }}
            className="disabled:opacity-50 bg-white whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
          >
            <PlusIcon
              className="-ml-2 mr-1 h-5 text-gray-400"
              aria-hidden="true"
            />
            <span>{t("add")}</span>
          </button>
        </span>
      </div>
      <GroceriesList groceries={groceries} barcodes={barcodes} />
    </>
  );
};
