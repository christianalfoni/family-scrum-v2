import { dashboardSelectors, Groceries } from "../features/DashboardFeature";
import { ChevronLeftIcon, LightBulbIcon, LightningBoltIcon } from "@heroicons/react/outline";
import { LightBulbIcon as SolidLightBulbIcon } from "@heroicons/react/solid";
import { groceryCategoryToBackgroundColor } from "../utils";
import { useShoppingList } from "../features/ShoppingListFeature";
import { useTranslations } from "next-intl";

import { useEffect } from "react";
import { useEnvironment } from "../environment";
import { match } from "react-states";



export const ShoppingListView = ({
  groceries,
  onBackClick,
}: {
  groceries: Groceries;
  onBackClick: () => void;
}) => {
  const { preventScreenSleep } = useEnvironment()
  const [shoppingList, send] = useShoppingList();
  const t = useTranslations("ShoppingListView");
  const groceriesByCategory = dashboardSelectors
    .groceriesByCategory(groceries)
    .filter((grocery) => Boolean(grocery.shopCount));


  useEffect(() => {
    preventScreenSleep.disable()
  }, [])

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <button
            onClick={onBackClick}
            className="flex-1 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="flex-2 text-lg font-medium">{t("shoppingList")}</h1>
          <span className="flex-1" />
          <button
          onClick={() => {
            send({
              type: 'TOGGLE_NO_SLEEP'
            })
            match(shoppingList, {
              LIST: () => {
                preventScreenSleep.enable()
                
              },
              NOSLEEP: () => {
                preventScreenSleep.disable()
              }
            })
          }}
          className="mx-auto inline-flex items-center justify-center border border-transparent text-sm font-medium rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {match(shoppingList, {
            LIST: () => <LightBulbIcon className="w-6 h-6" />,
            NOSLEEP: () => <SolidLightBulbIcon className="w-6 h-6 text-yellow-500" />
          })}
        </button>
        </div>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
        {groceriesByCategory.map((grocery) => {
          const color = groceryCategoryToBackgroundColor(grocery.category);
          return (
            <li
              key={grocery.id}
              onClick={() => {
                send({
                  type: "SHOP_GROCERY",
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
                  <h2 className="font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {grocery.name}
                  </h2>
                </span>

                <span className="ml-auto text-sm text-gray-500 group-hover:text-gray-900 font-medium truncate">
                  {grocery.shopCount}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
