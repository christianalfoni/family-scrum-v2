import { ChevronLeftIcon, ShoppingCartIcon } from "@heroicons/react/outline";
import { useShoppingLists } from "../features/ShoppingListsFeature";
import { EditGroceriesShoppingFeature } from '../features/EditGroceriesShoppingFeature'
import { useTranslations } from "next-intl";

import { useEffect } from "react";
import { useEnvironment } from "../environment";
import { EditGroceriesShoppingList } from "./EditGroceriesShoppingList";
import { GroceriesShoppingList } from "./GroceriesShoppingList";


import { match } from "react-states";
import { GroceriesShoppingFeature } from "../features/GroceriesShoppingFeature";


export const ShoppingListsView = ({
  familyId,
  onBackClick,
}: {
  familyId: string,
  onBackClick: () => void;
}) => {
  const { preventScreenSleep } = useEnvironment()
  const [shoppingLists, send] = useShoppingLists();
  const t = useTranslations("ShoppingListView");

  useEffect(() => {
    preventScreenSleep.disable()
  }, [])

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
          <h1 className="flex-2 text-lg font-medium">{t("shoppingList")}</h1>
          <span className="flex-1" />
        </div>
      </div>
      {match(shoppingLists, {
        EDITING: ({ list }) => match(list, {
          GROCERIES_LIST: () => <EditGroceriesShoppingFeature familyId={familyId}><EditGroceriesShoppingList /></EditGroceriesShoppingFeature>,
          GENERIC_LIST: () => null
        }),
        SHOPPING: ({ list }) => match(list, {
          GROCERIES_LIST: () => <GroceriesShoppingFeature familyId={familyId}><GroceriesShoppingList /></GroceriesShoppingFeature>,
          GENERIC_LIST: () => null
        })
      })}
      <button
        type="button"
        className={`${match(shoppingLists, {
          EDITING: () => 'text-gray-400 bg-gray-50',
          SHOPPING: () => 'text-white bg-yellow-500',
        })}
        z-50 fixed right-6 bottom-6 h-14 w-14 rounded-full inline-flex items-center justify-center px-3 py-2 border border-gray-100 shadow-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
      >
        <ShoppingCartIcon
          className="w-8 h-8"
          onClick={() => {
            send({
              type: 'TOGGLE_SHOPPING',
            });
            match(shoppingLists, {
              EDITING: () => {
                preventScreenSleep.enable()

              },
              SHOPPING: () => {
                preventScreenSleep.disable()
              }
            })
          }}
        />
      </button>
    </div>
  );
};

