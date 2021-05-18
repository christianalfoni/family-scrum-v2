import {
  CalendarIcon,
  PencilIcon,
  ReplyIcon,
  ShoppingCartIcon,
  UserAddIcon,
} from "@heroicons/react/outline";
import { format } from "date-fns";
import React from "react";
import { match } from "react-states";
import {
  Groceries,
  Tasks,
  useDashboard,
  Week,
  dashboardSelectors,
  DashboardUIEvent,
} from "../../features/DashboardFeature";
import {
  CalendarEvents,
  ContentContext,
  Family,
} from "../../features/DashboardFeature/DashboardFeature";
import {
  weekdays,
  groceryCategoryToBackgroundColor,
  getCurrentDayIndex,
} from "../../utils";

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
        <div
          className={`${
            weekdays[getCurrentDayIndex()] === weekday
              ? "bg-red-500"
              : "bg-gray-200"
          } flex-shrink-0 w-2.5 h-2.5 rounded-full`}
          aria-hidden="true"
        />
        <h4 className="text-gray-600 ml-2 text-lg">{weekday}</h4>
      </div>
      {children}
    </div>
  )
);

const WeekdaySkeleton = React.memo(
  ({ weekday, className = "" }: { weekday: string; className?: string }) => (
    <div
      className={`${className} sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500`}
    >
      <div className="flex items-center">
        <div
          className="bg-gray-400 flex-shrink-0 w-2.5 h-2.5 rounded-full"
          aria-hidden="true"
        />
        <h4 className="text-gray-400 ml-2 text-lg">{weekday}</h4>
      </div>
    </div>
  )
);

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

const GroceryListLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 lg:col-span-2 gap-4 min-h-full">
    <section aria-labelledby="recent-hires-title">
      <div className="h-full rounded-lg bg-white overflow-hidden shadow">
        <div className="p-6 flex flex-col h-full">{children}</div>
      </div>
    </section>
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
  currentContent: ContentContext["state"] | undefined,
  onClick: (event: DashboardUIEvent) => void
) => [
  {
    title: "Weekdays",
    active: currentContent === "WEEKDAYS",
    Icon: CalendarIcon,
    onClick: () =>
      onClick({
        type: "WEEKDAYS_SELECTED",
      }),
  },
  {
    title: "Groceries",
    active: currentContent === "GROCERIES",
    Icon: ShoppingCartIcon,
    onClick: () =>
      onClick({
        type: "GROCERIES_SELECTED",
      }),
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
          {getMenuItems(undefined, () => {}).map((menuItem) => (
            <MenuItem
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
  const [dashboard, send] = useDashboard("LOADED");

  return (
    <div className="grid grid-cols-1 gap-4 lg:col-span-6 h-full">
      <section className="h-full flex flex-col">
        <div className="hidden lg:block lg:col-span-3">
          <nav className="flex space-x-4 p-3 pt-0">
            {getMenuItems(dashboard.content.state, (event) => {
              send(event);
            }).map((menuItem) => (
              <MenuItem
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
};

export const DashboardSkeleton = () => (
  <DashboardLayout>
    <GroceryListLayout>
      <div className="flex items-center">
        <span className="text-gray-600 inline-flex pt-3 pb-3 ring-4 ring-white">
          <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h4 className="text-gray-600 ml-2 text-lg">Shopping list</h4>
      </div>
      <div className="flow-root mt-6 flex-grow">
        <ul className="-my-5 divide-y divide-gray-200"></ul>
      </div>
    </GroceryListLayout>

    <MainContentLayoutSkeleton>
      <WeekdaySkeleton weekday="Monday" className="rounded-tl-lg" />
      <WeekdaySkeleton weekday="Tuesday" />
      <WeekdaySkeleton weekday="Wednesday" className="rounded-tr-lg" />
      <WeekdaySkeleton weekday="Thursday" />
      <WeekdaySkeleton weekday="Friday" />
      <WeekdaySkeleton weekday="Saturday" />
      <WeekdaySkeleton weekday="Sunday" className="rounded-bl-lg" />
      <div className="col-span-2 rounded-br-lg sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500">
        <h4 className="text-gray-400">Events</h4>
      </div>
    </MainContentLayoutSkeleton>
  </DashboardLayout>
);

export const GroceryList = ({ groceries }: { groceries: Groceries }) => {
  const groceriesByCategory = dashboardSelectors.groceriesByCategory(groceries);

  return (
    <GroceryListLayout>
      <div className="flex items-center">
        <span className="text-gray-600 inline-flex pt-3 pb-3 ring-4 ring-white">
          <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h4 className="text-gray-600 ml-2 text-lg">Shopping list</h4>
      </div>
      <div className="flow-root mt-6 flex-grow">
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
  );
};

export const Weekdays = ({
  tasks,
  week,
  family,
  events,
}: {
  tasks: Tasks;
  week: Week;
  family: Family;
  events: CalendarEvents;
}) => {
  const tasksByWeekday = dashboardSelectors.tasksByWeekday(week);

  return (
    <>
      {tasksByWeekday.map((weekdayTasks, index) => (
        <Weekday
          key={index}
          weekday={weekdays[index]}
          className={
            [
              "rounded-tl-lg",
              undefined,
              "rounded-tr-lg",
              undefined,
              undefined,
              undefined,
              "rounded-bl-lg",
            ][index]
          }
        >
          <ul className="mt-2 ">
            {Object.keys(weekdayTasks).map((taskId) => (
              <li
                key={taskId}
                className="py-3 flex justify-between items-center"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex flex-shrink-0 -space-x-1">
                    {weekdayTasks[taskId].map((userId) => (
                      <img
                        key={userId}
                        className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                        src={family.users[userId].avatar!}
                        alt={family.users[userId].name}
                      />
                    ))}
                  </div>
                  <p className="ml-4 text-sm font-medium text-gray-900">
                    {tasks[taskId].description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Weekday>
      ))}

      <div className="col-span-2 rounded-br-lg sm:rounded-tr-none relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500">
        <h4 className="text-gray-600">Events</h4>
        <ul>
          {Object.keys(events).map((eventId) => {
            const event = events[eventId];

            return (
              <li
                key={eventId}
                className="py-3 flex justify-between items-center"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xs leading-5 font-medium">
                    {format(event.date, "dd.MM.yyyy")}
                  </span>
                  <div className="flex flex-shrink-0 -space-x-1">
                    {event.userIds.map((userId) => (
                      <img
                        key={userId}
                        className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                        src={family.users[userId].avatar!}
                        alt={family.users[userId].name}
                      />
                    ))}
                  </div>

                  <p className="ml-4 text-sm font-medium text-gray-900">
                    {event.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

const GroceriesContent = () => (
  <div className="bg-white col-span-3 p-6">
    <span className="relative z-0 inline-flex shadow-sm rounded-md sm:shadow-none sm:space-x-3">
      <span className="inline-flex sm:shadow-sm">
        <button
          type="button"
          className="bg-red-500 relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium text-white hover:bg-red-400 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
        >
          <span>Fish, Meat and Dairy</span>
        </button>
        <button
          type="button"
          className="hidden sm:inline-flex -ml-px relative items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-green-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
        >
          <span>Fruit and Vegetables</span>
        </button>
        <button
          type="button"
          className="hidden sm:inline-flex -ml-px relative items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-yellow-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
        >
          <span>Dry Goods</span>
        </button>
        <button
          type="button"
          className="hidden sm:inline-flex -ml-px relative items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
        >
          <span>Frozen</span>
        </button>
        <button
          type="button"
          className="hidden sm:inline-flex -ml-px relative items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
        >
          <span>Other</span>
        </button>
      </span>
    </span>
  </div>
);

export const Dashboard = () => {
  const [dashboard, send] = useDashboard();

  return match(dashboard, {
    AWAITING_AUTHENTICATION: () => <DashboardSkeleton />,
    ERROR: () => <DashboardSkeleton />,
    LOADED: ({ groceries, tasks, week, family, events, content }) => (
      <DashboardLayout>
        <GroceryList groceries={groceries} />
        <MainContentLayout>
          {match(content, {
            GROCERIES: () => <GroceriesContent />,
            WEEKDAYS: () => (
              <Weekdays
                tasks={tasks}
                week={week}
                family={family}
                events={events}
              />
            ),
          })}
        </MainContentLayout>
      </DashboardLayout>
    ),
    LOADING: () => <DashboardSkeleton />,
    REQUIRING_AUTHENTICATION: () => <DashboardSkeleton />,
  });
};

/*

*/
