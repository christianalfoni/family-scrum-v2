import { dashboardSelectors, Groceries } from "../features/DashboardFeature";
import { ChevronLeftIcon } from "@heroicons/react/outline";
import { groceryCategoryToBackgroundColor } from "../utils";
import { useGroceryList } from "../features/GroceryListFeature";

export const ShoppingListView = ({
  groceries,
  onBackClick,
}: {
  groceries: Groceries;
  onBackClick: () => void;
}) => {
  const [, send] = useGroceryList();
  const groceriesByCategory = dashboardSelectors
    .groceriesByCategory(groceries)
    .filter((grocery) => Boolean(grocery.shopCount));

  return (
    <div className="bg-white lg:min-w-0 lg:flex-1">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <button
            onClick={onBackClick}
            className="flex-1 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="flex-2 text-lg font-medium">Shopping List</h1>
          <span className="flex-1" />
        </div>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200">
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
