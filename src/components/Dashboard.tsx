import { CalendarIcon, ShoppingCartIcon } from "@heroicons/react/outline";
import React from "react";
import { match } from "react-states";
import { useDashboard } from "../features/DashboardFeature";
import { View } from "../features/DashboardFeature/DashboardFeature";
import { GroceriesView } from "./GroceriesView";
import { GroceryList, GroceryListSkeleton } from "./GroceryList";
import { WeekdaysView, WeekdaysSkeleton } from "./Weekdays";

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

const MenuItem = ({
  active = false,
  Icon,
  children,
  onClick,
}: {
  active?: boolean;
  Icon: React.FC<{ className: string }>;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <a
    onClick={() => onClick()}
    className={`${
      active
        ? "bg-gray-100 text-gray-900"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }  group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
  >
    <Icon
      className={`${
        active ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
      } group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6`}
      aria-hidden="true"
    />
    {children}
  </a>
);

const getMenuItems = (
  currentView: View | undefined,
  onClick: (view: View) => void
) => [
  {
    title: "Weekdays",
    active: currentView === "WEEKDAYS",
    Icon: CalendarIcon,
    onClick: () => onClick("WEEKDAYS"),
  },
  {
    title: "Groceries",
    active: currentView === "GROCERIES",
    Icon: ShoppingCartIcon,
    onClick: () => onClick("GROCERIES"),
  },
];

const MainContentLayoutSkeleton = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-1 gap-4 lg:col-span-6 h-full">
    <section className="h-full flex flex-col">
      <div className="hidden lg:block lg:col-span-3">
        <nav className="flex space-x-4 p-3 pt-0">
          {getMenuItems(undefined, () => {}).map((menuItem, index) => (
            <MenuItem
              key={index}
              Icon={menuItem.Icon}
              onClick={() => {
                menuItem.onClick();
              }}
            >
              {menuItem.title}
            </MenuItem>
          ))}
        </nav>
      </div>
      <div className="flex-grow rounded-lg bg-gray-200 overflow-hidden shadow divide-y divide-gray-200 sm:divide-y-0 sm:grid sm:grid-cols-3 sm:gap-px">
        {children}
      </div>
    </section>
  </div>
);
const MainContentLayout = ({ children }: { children: React.ReactNode }) => {
  const [dashboard, send] = useDashboard();

  const renderContent = (view: View) => (
    <div className="grid grid-cols-1 gap-4 lg:col-span-6 h-full">
      <section className="h-full flex flex-col">
        <div className="hidden lg:block lg:col-span-3">
          <nav className="flex space-x-4 p-3 pt-0">
            {getMenuItems(view, (view) => {
              send({
                type: "VIEW_SELECTED",
                view,
              });
            }).map((menuItem, index) => (
              <MenuItem
                key={index}
                active={menuItem.active}
                Icon={menuItem.Icon}
                onClick={() => {
                  menuItem.onClick();
                }}
              >
                {menuItem.title}
              </MenuItem>
            ))}
          </nav>
        </div>
        <div className="flex-grow rounded-lg bg-gray-200 overflow-hidden shadow divide-y divide-gray-200 sm:divide-y-0 sm:grid sm:grid-cols-3 sm:gap-px">
          {children}
        </div>
      </section>
    </div>
  );

  return match(dashboard, {
    AWAITING_AUTHENTICATION: () => null,
    ERROR: () => null,
    LOADING: () => null,
    REQUIRING_AUTHENTICATION: () => null,
    GROCERIES: ({ state }) => renderContent(state),
    WEEKDAYS: ({ state }) => renderContent(state),
  });
};

export const DashboardSkeleton = () => (
  <DashboardLayout>
    <GroceryListSkeleton />
    <MainContentLayoutSkeleton>
      <WeekdaysSkeleton />
    </MainContentLayoutSkeleton>
  </DashboardLayout>
);

export const Dashboard = () => {
  const [dashboard, send] = useDashboard();

  return match(dashboard, {
    AWAITING_AUTHENTICATION: () => <DashboardSkeleton />,
    ERROR: () => <DashboardSkeleton />,
    WEEKDAYS: ({ groceries, tasks, week, family, events }) => (
      <DashboardLayout>
        <GroceryList groceries={groceries} />
        <MainContentLayout>
          <WeekdaysView
            tasks={tasks}
            week={week}
            family={family}
            events={events}
          />
        </MainContentLayout>
      </DashboardLayout>
    ),
    GROCERIES: ({ groceries, activeCategory, groceryInput }) => (
      <DashboardLayout>
        <GroceryList groceries={groceries} />
        <MainContentLayout>
          <GroceriesView
            groceries={groceries}
            activeCategory={activeCategory}
            groceryInput={groceryInput}
          />
        </MainContentLayout>
      </DashboardLayout>
    ),
    LOADING: () => <DashboardSkeleton />,
    REQUIRING_AUTHENTICATION: () => <DashboardSkeleton />,
  });
};

/*

*/
