import { CalendarIcon, ShoppingCartIcon } from "@heroicons/react/outline";
import {
  useDasbhoard,
  DashboardViewContext,
} from "../features/DashboardFeature";

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
  currentView: DashboardViewContext | undefined,
  onClick: (view: DashboardViewContext) => void
) => [
  {
    title: "Weekdays",
    active: currentView?.state === "WEEKDAYS",
    Icon: CalendarIcon,
    onClick: () => onClick({ state: "WEEKDAYS" }),
  },
  {
    title: "Groceries",
    active: currentView?.state === "GROCERIES",
    Icon: ShoppingCartIcon,
    onClick: () => onClick({ state: "GROCERIES" }),
  },
];

export const MainContentLayoutSkeleton = ({
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
export const MainContentLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [dashboard, send] = useDasbhoard("LOADED");

  return (
    <div className="grid grid-cols-1 gap-4 lg:col-span-6 h-full">
      <section className="h-full flex flex-col">
        <div className="hidden lg:block lg:col-span-3">
          <nav className="flex space-x-4 p-3 pt-0">
            {getMenuItems(dashboard.view, (view) => {
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
};
