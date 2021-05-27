import React from "react";
import { match } from "react-states";
import { useDasbhoard } from "../features/DashboardFeature";
import { GroceriesFeature } from "../features/GroceriesFeature";
import { GroceryListFeature } from "../features/GroceryListFeature";
import { WeekdaysFeature } from "../features/WeekdaysFeature";
import { GroceriesView } from "./GroceriesView";
import { GroceryList, GroceryListSkeleton } from "./GroceryList";
import {
  MainContentLayout,
  MainContentLayoutSkeleton,
} from "./MainContentLayout";
import { WeekdaysView, WeekdaysSkeleton } from "./WeekdaysView";

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
      <WeekdaysSkeleton />
    </MainContentLayoutSkeleton>
  </DashboardLayout>
);

export const Dashboard = () => {
  const [dashboard] = useDasbhoard();

  return match(dashboard, {
    AWAITING_AUTHENTICATION: () => <DashboardSkeleton />,
    ERROR: () => <DashboardSkeleton />,
    LOADED: ({ groceries, todos, currentWeek, family, events, view }) => {
      return (
        <DashboardLayout>
          <GroceryListFeature familyId={family.id}>
            <GroceryList groceries={groceries} />
          </GroceryListFeature>
          <MainContentLayout>
            {match(view, {
              // Not available in this version of the app
              SHOPPING_LIST: () => null,
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
              GROCERIES: () => (
                <GroceriesFeature familyId={family.id}>
                  <GroceriesView groceries={groceries} />
                </GroceriesFeature>
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
