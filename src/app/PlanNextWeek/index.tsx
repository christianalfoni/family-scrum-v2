import { CheckCircleIcon, HeartIcon } from "@heroicons/react/24/solid";
import { NavLink, Outlet, useNavigate } from "react-router";
import { PageLayout } from "../common/PageLayout";

function PlanNextWeekTabs() {
  return (
    <div className="shadow-sm rounded-l-md rounded-r-md">
      <NavLink
        to="todos"
        className="flex-1 inline-flex -ml-px relative items-center px-4 py-2 rounded-l-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
      >
        {({ isActive }) => (
          <>
            <CheckCircleIcon
              className={`mr-1 h-5 w-5 ${
                isActive ? "text-green-400" : "text-gray-400"
              }`}
              aria-hidden="true"
            />
            <span>Todos</span>
          </>
        )}
      </NavLink>
      <NavLink
        to="dinners"
        className="flex-1 relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
      >
        {({ isActive }) => (
          <>
            <HeartIcon
              className={`mr-1 h-5 w-5 ${
                isActive ? "text-red-400" : "text-gray-400"
              }`}
              aria-hidden="true"
            />
            <span>Dinners</span>
          </>
        )}
      </NavLink>
    </div>
  );
}

export function PlanNextWeek() {
  const navigate = useNavigate();

  return (
    <PageLayout title={<PlanNextWeekTabs />} onBackClick={() => navigate("/")}>
      <Outlet />
    </PageLayout>
  );
}
