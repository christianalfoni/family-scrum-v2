import { Menu, Transition } from "@headlessui/react";
import { DotsVerticalIcon, PlusIcon } from "@heroicons/react/outline";
import React from "react";
import { match } from "react-states";

import { Groceries, dashboardSelectors } from "../features/DashboardFeature";
import { GroceryCategory, useGroceries } from "../features/GroceriesFeature";
import { groceryCategoryToBackgroundColor } from "../utils";

const GroceriesToolbar = () => {
  const [groceries, send] = useGroceries();
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
            className={`${
              activeCategory === GroceryCategory.MeatDairy
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-white text-gray-500 hover:bg-gray-50"
            } relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600`}
          >
            <span>Fish, Meat and Dairy</span>
          </button>
          <button
            type="button"
            onClick={() =>
              send({
                type: "GROCERY_CATEGORY_TOGGLED",
                category: GroceryCategory.FruitVegetables,
              })
            }
            className={`${
              activeCategory === GroceryCategory.FruitVegetables
                ? "bg-green-500 text-white hover:bg-green-400"
                : "bg-white text-gray-500 hover:bg-gray-50"
            } relative inline-flex items-center px-4 py-2  border border-gray-300 text-sm font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600`}
          >
            <span>Fruit and Vegetables</span>
          </button>
          <button
            type="button"
            onClick={() =>
              send({
                type: "GROCERY_CATEGORY_TOGGLED",
                category: GroceryCategory.DryGoods,
              })
            }
            className={`${
              activeCategory === GroceryCategory.DryGoods
                ? "bg-yellow-500 text-white hover:bg-yellow-400"
                : "bg-white text-gray-500 hover:bg-gray-50"
            } relative inline-flex items-center px-4 py-2  border border-gray-300 text-sm font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-yellow-600 focus:border-yellow-600`}
          >
            <span>Dry Goods</span>
          </button>
          <button
            type="button"
            onClick={() =>
              send({
                type: "GROCERY_CATEGORY_TOGGLED",
                category: GroceryCategory.Frozen,
              })
            }
            className={`${
              activeCategory === GroceryCategory.Frozen
                ? "bg-blue-500 text-white hover:bg-blue-400"
                : "bg-white text-gray-500 hover:bg-gray-50"
            } relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600`}
          >
            <span>Frozen</span>
          </button>
          <button
            type="button"
            onClick={() =>
              send({
                type: "GROCERY_CATEGORY_TOGGLED",
                category: GroceryCategory.Other,
              })
            }
            className={`${
              activeCategory === GroceryCategory.Other
                ? "bg-gray-500 text-white hover:bg-gray-400"
                : "bg-white text-gray-500 hover:bg-gray-50"
            } relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium  focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600`}
          >
            <span>Other</span>
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
            placeholder="Find/New grocery"
            aria-describedby="add_team_members_helper"
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
            <span>Add</span>
          </button>
        </span>
      </div>
    </div>
  );
};

export const GroceriesView = ({ groceries }: { groceries: Groceries }) => {
  const [groceriesFeature, send] = useGroceries();

  const sortedAndFilteredGroceries = match(groceriesFeature, {
    FILTERED: ({ category }) =>
      dashboardSelectors.filterGroceriesByCategory(groceries, category),
    UNFILTERED: ({ input }) =>
      dashboardSelectors.filterGroceriesByInput(
        dashboardSelectors.groceriesByCategory(groceries),
        input
      ),
  });

  return (
    <div className="bg-white col-span-3 p-6">
      <GroceriesToolbar />
      <ul className="grid gap-4 grid-cols-4 mt-3">
        {sortedAndFilteredGroceries.map((grocery) => (
          <li
            key={grocery.id}
            className="relative col-span-1 flex shadow-sm rounded-md"
          >
            <div
              onClick={() => {
                send({
                  type: "INCREASE_SHOP_COUNT",
                  id: grocery.id,
                });
              }}
              className={`bg-${groceryCategoryToBackgroundColor(
                grocery.category
              )}-500 flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md`}
            >
              {grocery.shopCount}
            </div>
            <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
              <div
                onClick={() => {
                  send({
                    type: "INCREASE_SHOP_COUNT",
                    id: grocery.id,
                  });
                }}
                className="flex-1 px-4 py-4 text-md truncate text-gray-900 font-medium hover:text-gray-600"
              >
                {grocery.name}
              </div>
              <Menu as="div" className="flex-shrink-0 pr-2">
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
                                onClick={() => {
                                  send({
                                    type: "RESET_SHOP_COUNT",
                                    id: grocery.id,
                                  });
                                }}
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                }
                                  block px-4 py-2 text-sm`}
                              >
                                Reset shop count
                              </a>
                            )}
                          </Menu.Item>
                        </div>
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="#"
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                }
                                  block px-4 py-2 text-sm`}
                              >
                                Delete
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
        ))}
      </ul>
    </div>
  );
};
