import {
  ClockIcon,
  CalendarIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";
import React from "react";
import { match } from "react-states";
import {
  Groceries,
  Tasks,
  useDashboard,
  Week,
  dashboardSelectors,
} from "../../features/DashboardFeature";
import { groceryCategoryToBackgroundColor } from "../../utils";

const Weekday = React.memo(
  ({
    weekday,
    className = "",
    children = null,
  }: {
    weekday: string;
    className?: string;
    children?: React.ReactNode;
  }) => (
    <div
      className={`${className} sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500`}
    >
      <div className="flex items-center">
        <span className="text-gray-400 bg-gray-50 rounded-lg inline-flex p-3 ring-4 ring-white">
          <ClockIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h4 className="text-gray-400 ml-2">{weekday}</h4>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  )
);

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-100">
    <main className="pt-8 pb-8 h-screen w-screen">
      <div className="mx-auto px-8 h-full flex items-stretch">
        <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-8 lg:gap-8 flex-grow">
          {children}
        </div>
      </div>
    </main>
  </div>
);

const GroceryListLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 lg:col-span-2 gap-4 min-h-full">
    <section aria-labelledby="recent-hires-title">
      <div className="h-full rounded-lg bg-white overflow-hidden shadow">
        <div className="p-6">{children}</div>
      </div>
    </section>
  </div>
);

const WeekdaysLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-4 lg:col-span-6 h-full">
    <section aria-labelledby="quick-links-title">
      <div className="h-full rounded-lg bg-gray-200 overflow-hidden shadow divide-y divide-gray-200 sm:divide-y-0 sm:grid sm:grid-cols-3 sm:gap-px">
        {children}
      </div>
    </section>
  </div>
);

export const DashboardSkeleton = () => (
  <DashboardLayout>
    <GroceryListLayout>
      <div>
        <span className="text-gray-400 bg-gray-50 rounded-lg inline-flex p-3 ring-4 ring-white">
          <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
      <div className="flow-root mt-6">
        <ul className="-my-5 divide-y divide-gray-200"></ul>
      </div>
    </GroceryListLayout>

    <WeekdaysLayout>
      <Weekday weekday="Monday" className="rounded-tl-lg" />
      <Weekday weekday="Tuesday" />
      <Weekday weekday="Wednesday" className="rounded-tr-lg" />
      <Weekday weekday="Thursday" />
      <Weekday weekday="Friday" />
      <Weekday weekday="Saturday" />
      <Weekday weekday="Sunday" className="rounded-bl-lg" />
      <div className="col-span-2 rounded-br-lg sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500">
        <div>
          <span className="text-gray-400 bg-gray-50 rounded-lg inline-flex p-3 ring-4 ring-white">
            <CalendarIcon className="h-6 w-6" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-8"></div>
      </div>
    </WeekdaysLayout>
  </DashboardLayout>
);

export const DashboardContent = ({
  groceries,
  tasks,
  week,
}: {
  groceries: Groceries;
  tasks: Tasks;
  week: Week;
}) => {
  const groceriesByCategory = dashboardSelectors.groceriesByCategory(groceries);

  return (
    <DashboardLayout>
      <GroceryListLayout>
        <div>
          <span className="text-gray-400 bg-gray-50 rounded-lg inline-flex p-3 ring-4 ring-white">
            <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
          </span>
        </div>
        <div className="flow-root mt-6">
          <ul className="-my-5 divide-y divide-gray-200">
            {groceriesByCategory.map((grocery) => (
              <li key={grocery.id} className="py-4">
                <div className="flex items-center">
                  <span className="flex items-center truncate space-x-3">
                    <span
                      className={`${groceryCategoryToBackgroundColor(
                        grocery.category
                      )} w-2.5 h-2.5 flex-shrink-0 rounded-full`}
                      aria-hidden="true"
                    />
                    <span className="font-medium truncate leading-6 text-lg">
                      {grocery.name}
                    </span>
                  </span>
                  <span className="flex-grow" />
                  <span className="font-normal text-gray-500">
                    {grocery.shopCount}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </GroceryListLayout>

      <WeekdaysLayout>
        <Weekday weekday="Monday" className="rounded-tl-lg" />
        <Weekday weekday="Tuesday" />
        <Weekday weekday="Wednesday" className="rounded-tr-lg" />
        <Weekday weekday="Thursday" />
        <Weekday weekday="Friday" />
        <Weekday weekday="Saturday" />
        <Weekday weekday="Sunday" className="rounded-bl-lg" />
        <div className="col-span-2 rounded-br-lg sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500">
          <div>
            <span className="text-gray-400 bg-gray-50 rounded-lg inline-flex p-3 ring-4 ring-white">
              <CalendarIcon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-8"></div>
        </div>
      </WeekdaysLayout>
    </DashboardLayout>
  );
};

export const Dashboard = () => {
  const [dashboard, send] = useDashboard();

  return match(dashboard, {
    AWAITING_AUTHENTICATION: () => <DashboardSkeleton />,
    ERROR: () => <DashboardSkeleton />,
    LOADED: ({ groceries, tasks, week }) => (
      <DashboardContent groceries={groceries} tasks={tasks} week={week} />
    ),
    LOADING: () => <DashboardSkeleton />,
    REQUIRING_AUTHENTICATION: () => <DashboardSkeleton />,
  });
};
