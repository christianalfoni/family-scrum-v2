import { Menu, Transition } from "@headlessui/react";
import { DotsVerticalIcon, PlusIcon } from "@heroicons/react/outline";
import React, { useState } from "react";
import { GroceryCategory } from "../../environment/storage";
import { Groceries, dashboardSelectors } from "../../features/DashboardFeature";
import { groceryCategoryToBackgroundColor } from "../../utils";

const getCategoryButtons = (
  activeCategory: GroceryCategory,
  onClick: (category: GroceryCategory) => void
) => [
  {
    title: "Fish, Meat and Dairy",
    active: activeCategory === GroceryCategory.MeatDairy,
    onClick: () => onClick(GroceryCategory.MeatDairy),
  },
  {
    title: "Fruit and Vegetables",
    active: activeCategory === GroceryCategory.FruitVegetables,
    onClick: () => onClick(GroceryCategory.FruitVegetables),
  },
  {
    title: "Dry Goods",
    active: activeCategory === GroceryCategory.DryGoods,
    onClick: () => onClick(GroceryCategory.DryGoods),
  },
  {
    title: "Frozen",
    active: activeCategory === GroceryCategory.Frozen,
    onClick: () => onClick(GroceryCategory.Frozen),
  },
  {
    title: "Other",
    active: activeCategory === GroceryCategory.Other,
    onClick: () => onClick(GroceryCategory.Other),
  },
];

const GroceriesToolbar = ({
  activeCategory,
  onCategoryClick,
}: {
  activeCategory: GroceryCategory | undefined;
  onCategoryClick: (category: GroceryCategory) => void;
}) => {
  const [newGroceryTitle, setNewGroceryTitle] = useState("");

  return (
    <div className="flex items-center flex-col">
      <div className="flex mb-4">
        <div className="flex-grow">
          <input
            type="text"
            disabled={!activeCategory}
            className="block w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
            placeholder="Grocery name"
            aria-describedby="add_team_members_helper"
          />
        </div>
        <span className="ml-3">
          <button
            type="button"
            disabled={!activeCategory}
            className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
          >
            <PlusIcon
              className="-ml-2 mr-1 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            <span>Add</span>
          </button>
        </span>
      </div>
      <span className="relative z-0 inline-flex shadow-sm rounded-md sm:shadow-none sm:space-x-3">
        <span className="inline-flex sm:shadow-sm">
          <button
            type="button"
            onClick={() => onCategoryClick(GroceryCategory.MeatDairy)}
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
            onClick={() => onCategoryClick(GroceryCategory.FruitVegetables)}
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
            onClick={() => onCategoryClick(GroceryCategory.DryGoods)}
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
            onClick={() => onCategoryClick(GroceryCategory.Frozen)}
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
            onClick={() => onCategoryClick(GroceryCategory.Other)}
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
    </div>
  );
};

export const GroceriesContent = ({
  groceries,
  activeCategory,
  onCategoryClick,
}: {
  groceries: Groceries;
  activeCategory?: GroceryCategory;
  onCategoryClick: (category: GroceryCategory) => void;
}) => {
  const sortedAndFilteredGroceries = activeCategory
    ? dashboardSelectors.filterGroceriesByCategory(groceries, activeCategory)
    : dashboardSelectors.groceriesByCategory(groceries);

  return (
    <div className="bg-white col-span-3 p-6">
      <GroceriesToolbar
        activeCategory={activeCategory}
        onCategoryClick={onCategoryClick}
      />
      <ul className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-6 mt-3">
        {sortedAndFilteredGroceries.map((grocery) => (
          <li
            key={grocery.id}
            className="relative col-span-1 flex shadow-sm rounded-md"
          >
            <div
              className={`${groceryCategoryToBackgroundColor(
                grocery.category
              )} flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md`}
            >
              {grocery.shopCount}
            </div>
            <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
              <div className="flex-1 px-4 py-4 text-md truncate text-gray-900 font-medium hover:text-gray-600">
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
