import * as React from "react";
import { Menu, Transition } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { dashboardSelectors, Groceries } from "../features/DashboardFeature";
import {
  ChevronLeftIcon,
  DotsVerticalIcon,
  PlusIcon,
  SearchIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";
import { groceryCategoryToBackgroundColor } from "../utils";

import { GroceryCategory, useGroceries } from "../features/GroceriesFeature";
import { match } from "react-states";

const groceryFilterButtons = [
  {
    Icon: ShoppingCartIcon,
    category: GroceryCategory.MeatDairy,
  },
  {
    Icon: ShoppingCartIcon,
    category: GroceryCategory.FruitVegetables,
  },
  {
    Icon: ShoppingCartIcon,
    category: GroceryCategory.DryGoods,
  },
  {
    Icon: ShoppingCartIcon,
    category: GroceryCategory.Frozen,
  },
  {
    Icon: ShoppingCartIcon,
    category: GroceryCategory.Other,
  },
];

export const GroceriesView = ({
  groceries,
  onBackClick,
}: {
  groceries: Groceries;
  onBackClick: () => void;
}) => {
  const [groceriesFeature, send] = useGroceries();
  const t = useTranslations("GroceriesView");
  const activeCategory = match(groceriesFeature, {
    FILTERED: ({ category }) => category,
    UNFILTERED: () => undefined,
  });
  const sortedAndFilteredGroceries = match(groceriesFeature, {
    FILTERED: ({ category, input }) =>
      input
        ? dashboardSelectors.filterGroceriesByInput(
          Object.values(groceries),
          input
        )
        : dashboardSelectors.filterGroceriesByCategory(groceries, category),
    UNFILTERED: ({ input }) =>
      dashboardSelectors.filterGroceriesByInput(
        dashboardSelectors.groceriesByCategory(groceries),
        input
      ),
  });

  return (
    <div className="bg-white h-screen flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200">
        <div className="flex items-center">
          <button
            onClick={onBackClick}
            className="flex-1 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="flex-2 text-lg font-medium">{t("groceries")}</h1>
          <span className="flex-1" />
        </div>
      </div>

      <span className="flex space-x-2 p-3 justify-center">
        {groceryFilterButtons.map((groceryFilterButton) => {
          const color = groceryCategoryToBackgroundColor(
            groceryFilterButton.category
          );
          return (
            <button
              key={groceryFilterButton.category}
              type="button"
              onClick={() =>
                send({
                  type: "GROCERY_CATEGORY_TOGGLED",
                  category: groceryFilterButton.category,
                })
              }
              className={`${activeCategory === groceryFilterButton.category
                ? `bg-${color}-500 text-white`
                : "bg-white text-gray-500 hover:bg-gray-50"
                } relative inline-flex rounded-lg items-center p-4  text-xs font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-${color}-600 focus:border-${color}-600`}
            >
              <groceryFilterButton.Icon
                className="w-6 h-6"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </span>
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
              value={groceriesFeature.input}
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
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-auto">
        {sortedAndFilteredGroceries.map((grocery) => {
          const color = groceryCategoryToBackgroundColor(grocery.category);
          return (
            <li
              key={grocery.id}
              onClick={() => {
                send({
                  type: "INCREASE_SHOP_COUNT",
                  id: grocery.id,
                });
              }}
              className="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6"
            >
              <div className="flex items-center">
                <span
                  className={`bg-${color}-300 h-4 w-4 rounded-full flex items-center justify-center`}
                  aria-hidden="true"
                >
                  <span className={`bg-${color}-500 h-2 w-2 rounded-full`} />
                </span>

                <span className="block ml-3">
                  <h2 className="font-medium">{grocery.name}</h2>
                </span>

                <span className="font-normal ml-auto text-gray-500">
                  {grocery.shopCount}
                </span>

                <Menu as="div" className="ml-3 flex-shrink-0 pr-2">
                  {({ open }) => (
                    <>
                      <Menu.Button className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        <span className="sr-only">Open options</span>
                        <DotsVerticalIcon
                          className="w-5 h-5"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                      <Transition
                        show={open}
                        as={React.Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items
                          static
                          className="z-10 mx-3 origin-top-right absolute right-10 top-3 w-48 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none"
                        >
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    send({
                                      type: "RESET_SHOP_COUNT",
                                      id: grocery.id,
                                    });
                                  }}
                                  className={`${active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                    }
                                    block px-4 py-2 text-sm`}
                                >
                                  {t("resetShopCount")}
                                </a>
                              )}
                            </Menu.Item>
                          </div>
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  href="#"
                                  className={`${active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                    }
                                    block px-4 py-2 text-sm`}
                                >
                                  {t("delete")}
                                </a>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
