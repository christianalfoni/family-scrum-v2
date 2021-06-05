import { Menu, Transition } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { DotsVerticalIcon, PlusIcon } from "@heroicons/react/outline";
import React from "react";
import { match } from "react-states";

import { Groceries, dashboardSelectors } from "../features/DashboardFeature";
import { GroceryCategory, useGroceries } from "../features/GroceriesFeature";
import { groceryCategoryToBackgroundColor } from "../utils";
import { GroceriesList } from "../common-components/GroceriesList";
import { Barcodes } from "../features/DashboardFeature/Feature";

const GroceriesToolbar = () => {
  const [groceries, send] = useGroceries();
  const t = useTranslations("GroceriesToolbar");
  const activeCategory = match(groceries, {
    FILTERED: ({ category }) => category,
    UNFILTERED: () => undefined,
  });
  return (
    <div className="flex items-center flex-col">
      <span className="relative z-0 inline-flex shadow-sm rounded-md sm:shadow-none sm:space-x-3">
        <span className="inline-flex sm:shadow-sm">
          <button
            type="button"
            onClick={() =>
              send({
                type: "GROCERY_CATEGORY_TOGGLED",
                category: GroceryCategory.MeatDairy,
              })
            }
            className={`${activeCategory === GroceryCategory.MeatDairy
              ? "bg-red-500 text-white hover:bg-red-400"
              : "bg-white text-gray-500 hover:bg-gray-50"
              } relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600`}
          >
            <span>{t('groceryCategory' + GroceryCategory.MeatDairy)}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              send({
                type: "GROCERY_CATEGORY_TOGGLED",
                category: GroceryCategory.FruitVegetables,
              })
            }
            className={`${activeCategory === GroceryCategory.FruitVegetables
              ? "bg-green-500 text-white hover:bg-green-400"
              : "bg-white text-gray-500 hover:bg-gray-50"
              } relative inline-flex items-center px-4 py-2  border border-gray-300 text-sm font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600`}
          >
            <span>{t('groceryCategory' + GroceryCategory.FruitVegetables)}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              send({
                type: "GROCERY_CATEGORY_TOGGLED",
                category: GroceryCategory.DryGoods,
              })
            }
            className={`${activeCategory === GroceryCategory.DryGoods
              ? "bg-yellow-500 text-white hover:bg-yellow-400"
              : "bg-white text-gray-500 hover:bg-gray-50"
              } relative inline-flex items-center px-4 py-2  border border-gray-300 text-sm font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-yellow-600 focus:border-yellow-600`}
          >
            <span>{t('groceryCategory' + GroceryCategory.DryGoods)}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              send({
                type: "GROCERY_CATEGORY_TOGGLED",
                category: GroceryCategory.Frozen,
              })
            }
            className={`${activeCategory === GroceryCategory.Frozen
              ? "bg-blue-500 text-white hover:bg-blue-400"
              : "bg-white text-gray-500 hover:bg-gray-50"
              } relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600`}
          >
            <span>{t('groceryCategory' + GroceryCategory.Frozen)}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              send({
                type: "GROCERY_CATEGORY_TOGGLED",
                category: GroceryCategory.Other,
              })
            }
            className={`${activeCategory === GroceryCategory.Other
              ? "bg-gray-500 text-white hover:bg-gray-400"
              : "bg-white text-gray-500 hover:bg-gray-50"
              } relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600`}
          >
            <span>{t('groceryCategory' + GroceryCategory.Other)}</span>
          </button>
        </span>
      </span>
      <div className="flex mt-4">
        <div className="flex-grow">
          <input
            type="text"
            value={groceries.input}
            onChange={(event) =>
              send({
                type: "GROCERY_INPUT_CHANGED",
                input: event.target.value,
              })
            }
            className="block disabled:opacity-50 w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
            placeholder={t("filterNewGrocery") as string}
          />
        </div>
        <span className="ml-3">
          <button
            type="button"
            disabled={match(groceries, {
              UNFILTERED: () => true,
              FILTERED: ({ input }) => (input ? false : true),
            })}
            onClick={() => {
              send({
                type: "ADD_GROCERY",
              });
            }}
            className="disabled:opacity-50 bg-white inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
          >
            <PlusIcon
              className="-ml-2 mr-1 h-5 text-gray-400"
              aria-hidden="true"
            />
            <span>{t("add")}</span>
          </button>
        </span>
      </div>
    </div>
  );
};

export const GroceriesView = ({ groceries, barcodes }: { groceries: Groceries, barcodes: Barcodes }) => (
  <div className="bg-white col-span-3 p-6">
    <GroceriesToolbar />
    <GroceriesList groceries={groceries} barcodes={barcodes} />
  </div>
);

