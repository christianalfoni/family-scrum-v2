import React from "react";
import { match } from "react-states";
import { useDasbhoard } from "../features/DashboardFeature";
import { EditGroceriesShoppingFeature } from "../features/EditGroceriesShoppingFeature";
import { ShoppingListsFeature } from "../features/ShoppingListsFeature";
import { WeekdaysFeature } from "../features/WeekdaysFeature";
import { ShoppingList, GroceryListSkeleton } from "./ShoppingList";
import {
  MainContentLayout,
  MainContentLayoutSkeleton,
} from "./MainContentLayout";
import { WeekdaysView, WeekdaysViewSkeleton } from "./WeekdaysView";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-50">
    <main className="pt-8 pb-8 h-screen w-screen">
      <div className="mx-auto px-8 h-full flex items-stretch">
        <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-8 lg:gap-8 flex-grow">
          {children}
        </div>
      </div>
    </main>
  </div>
);

export const DashboardSkeleton = () => (
  <DashboardLayout>
    <GroceryListSkeleton />
    <MainContentLayoutSkeleton>
      <WeekdaysViewSkeleton />
    </MainContentLayoutSkeleton>
  </DashboardLayout>
);

export const Dashboard = () => {
  const [dashboard] = useDasbhoard();

  return match(dashboard, {
    AWAITING_AUTHENTICATION: () => <DashboardSkeleton />,
    ERROR: () => <DashboardSkeleton />,
    LOADED: ({ groceries, todos, currentWeek, family, events, view, barcodes }) => {
      return (
        <DashboardLayout>
          <ShoppingListsFeature familyId={family.id}>
            <ShoppingList groceries={groceries} />
          </ShoppingListsFeature>
          <MainContentLayout>
            {match(view, {
              // Not available in this version of the app
              SHOPPING_LISTS: () => null,
              PLAN_CURRENT_WEEK: () => null,
              PLAN_NEXT_WEEK: () => null,
              ADD_TODO: () => null,

              WEEKDAYS: () => (
                <WeekdaysFeature>
                  <WeekdaysView
                    todos={todos}
                    week={currentWeek}
                    family={family}
                    events={events}
                  />
                </WeekdaysFeature>
              ),
            })}
          </MainContentLayout>
        </DashboardLayout>
      );
    },
    LOADING: () => <DashboardSkeleton />,
    REQUIRING_AUTHENTICATION: () => <DashboardSkeleton />,
  });
};
