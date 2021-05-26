import * as React from "react";
import { dashboardSelectors, Tasks } from "../features/DashboardFeature";
import { usePlanWeek } from "../features/PlanWeekFeature";
import { Menu, Transition } from "@headlessui/react";
import { ChevronLeftIcon, DotsVerticalIcon } from "@heroicons/react/outline";
import { Family, Week } from "../features/DashboardFeature/Feature";
import { weekdays } from "../utils";

export const PlanWeekView = ({
  family,
  tasks,
  week,
  onBackClick,
}: {
  family: Family;
  week: Week;
  tasks: Tasks;
  onBackClick: () => void;
}) => {
  const [planWeek, send] = usePlanWeek();
  const tasksList = Object.values(tasks);

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
          <h1 className="flex-2 text-lg font-medium">Plan Week</h1>
          <span className="flex-1" />
        </div>
      </div>
      <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200">
        {tasksList.map((task) => {
          return (
            <li key={task.id} className="relative pl-4 pr-6 py-5 ">
              <div className="flex items-center">
                <span className="block">
                  <h2 className="font-medium">{task.description}</h2>
                </span>
                <Menu as="div" className="ml-auto flex-shrink-0">
                  {({ open }) => (
                    <>
                      <Menu.Button className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        <span className="sr-only">Open options</span>
                        <DotsVerticalIcon
                          className="w-5 h-5"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                      <Transition
                        show={open}
                        as={React.Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items
                          static
                          className="z-10 mx-3 origin-top-right absolute right-10 top-3 w-48 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none"
                        >
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  onClick={(event) => {
                                    event.stopPropagation();
                                  }}
                                  className={`${
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700"
                                  }
                                    block px-4 py-2 text-sm`}
                                >
                                  Archive
                                </a>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
              </div>
              {Object.keys(family.users).map((userId) => (
                <div
                  key={userId}
                  className="flex pt-2 items-center justify-between"
                >
                  <img
                    key={userId}
                    className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                    src={family.users[userId].avatar!}
                    alt={family.users[userId].name}
                  />
                  {week.tasks[task.id][userId].map((isActive, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        send({
                          type: "TOGGLE_WEEKDAY",
                          active: !isActive,
                          taskId: task.id,
                          userId,
                          weekdayIndex: index,
                        });
                      }}
                      className={`${
                        isActive
                          ? "text-white bg-red-500"
                          : "text-gray-700 bg-white"
                      } order-1 w-10 h-8 justify-center inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:order-0 sm:ml-0`}
                    >
                      {weekdays[index].substr(0, 2)}
                    </button>
                  ))}
                </div>
              ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
