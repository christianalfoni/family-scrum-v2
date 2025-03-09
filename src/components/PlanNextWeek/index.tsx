import {
  CheckCircleIcon,
  ChevronLeftIcon,
  HeartIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { NavLink, Outlet, useNavigate } from "react-router";

export function PlanNextWeek() {
  const navigate = useNavigate();

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <div className="flex-1">
            <button
              onClick={() => navigate("/")}
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="flex shadow-sm flex-2 rounded-l-md rounded-r-md">
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
        </div>
      </div>
      <Outlet />
    </div>
  );
}
