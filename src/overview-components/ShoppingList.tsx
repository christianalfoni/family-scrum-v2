import { ShoppingCartIcon } from "@heroicons/react/outline";
import React from "react";
import { useTranslations } from "next-intl";
import { Groceries } from "../features/DashboardFeature";
import { groceriesShoppingSelectors } from "../features/GroceriesShoppingFeature";

const GroceryListLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 lg:col-span-2 gap-4 min-h-full">
    <section aria-labelledby="recent-hires-title">
      <div className="h-full rounded-lg bg-white overflow-hidden shadow">
        <div className="p-6 flex flex-col h-full">{children}</div>
      </div>
    </section>
  </div>
);

export const GroceryListSkeleton = () => {
  const t = useTranslations("ShoppingList");

  return (
    <GroceryListLayout>
      <div className="flex items-center">
        <span className="text-gray-600 inline-flex pt-3 pb-3 ring-4 ring-white">
          <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h4 className="text-gray-600 ml-2 text-lg">{t("shoppingList")}</h4>
      </div>
      <div className="flow-root mt-6 flex-grow">
        <ul className="-my-5 divide-y divide-gray-200"></ul>
      </div>
    </GroceryListLayout>
  );
};

export const ShoppingList = React.memo(
  ({ groceries }: { groceries: Groceries }) => {
    const groceriesToShop = groceriesShoppingSelectors
      .groceriesToShop(groceries)
    const t = useTranslations("ShoppingList");

    return (
      <GroceryListLayout>
        <div className="flex items-center">
          <span className="text-gray-600 inline-flex pt-3 pb-3 ring-4 ring-white">
            <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h4 className="text-gray-600 ml-2 text-lg">{t("shoppingList")}</h4>
        </div>
        <div className="flow-root mt-6 flex-grow">
          <ul className="-my-5">
            {groceriesToShop.map((grocery) => (
              <li key={grocery.id} className="py-2">
                <div className="flex items-center">
                  <span className="font-normal text-gray-500">
                    {grocery.shopCount}
                  </span>
                  <span className="flex items-center truncate space-x-3 ml-3 ">
                    <span className="font-medium truncate leading-6 text-md">
                      {grocery.name}
                    </span>
                  </span>
                  <span className="flex-grow" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </GroceryListLayout>
    );
  }
);
