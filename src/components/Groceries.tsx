import {
  ChevronLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  LightBulbIcon as SolidLightBulbIcon,
} from "@heroicons/react/24/solid";
import { LightBulbIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useFamilyScrum } from "./FamilyScrumContext";

export function Groceries() {
  const familyScrum = useFamilyScrum();
  const navigate = useNavigate();
  const awake = familyScrum.awake;
  const groceries = familyScrum.groceries;
  const [filter, setFilter] = useState("");
  const pendingGroceryName = groceries.addGrocery.pendingParams?.[0];
  const shoppingGroceryId = groceries.shopGrocery.pendingParams?.[0];

  useEffect(groceries.subscribe, []);

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <div className="flex-1">
            <button
              onClick={() => navigate(-1)}
              className=" bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <h1 className="flex-2 text-lg font-medium">Shopping List</h1>
          <span className="flex-1" />
          <div
            onClick={() => awake.toggle()}
            className="relative mx-auto inline-flex items-center justify-center border border-transparent text-sm font-medium rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {awake.current === "ON" ? (
              <SolidLightBulbIcon className="w-6 h-6 text-yellow-500" />
            ) : (
              <LightBulbIcon className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="w-full">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              id="search"
              name="search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
              placeholder="Add/Filter grocery..."
              type="search"
            />
          </div>
        </div>
        <span className="ml-3">
          <button
            type="button"
            className="disabled:opacity-50 bg-white whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
            {...(filter.length && !pendingGroceryName
              ? {
                  disabled: false,
                  onClick: () => {
                    groceries.addGrocery.mutate(filter);
                    setFilter("");
                  },
                }
              : { disabled: true, onClick: undefined })}
          >
            <PlusIcon
              className="-ml-2 mr-1 h-5 text-gray-400"
              aria-hidden="true"
            />
            <span>Add</span>
          </button>
        </span>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
        {pendingGroceryName ? <Grocery name={pendingGroceryName} /> : null}
        {groceries
          .filterGroceries(filter)
          .map((grocery) =>
            shoppingGroceryId === grocery.id ? null : (
              <Grocery
                key={grocery.id}
                name={grocery.name}
                onClick={() => groceries.shopGrocery.mutate(grocery.id)}
              />
            )
          )}
      </ul>
    </div>
  );
}

function Grocery({ name, onClick }: { name: string; onClick?: () => void }) {
  return (
    <li
      onClick={onClick}
      className="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6"
    >
      <div className="flex items-center">
        <span className="block">
          <h2 className="font-medium">
            <span className="absolute inset-0" aria-hidden="true" />
            {name}
          </h2>
        </span>
      </div>
    </li>
  );
}
