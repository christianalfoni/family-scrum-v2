import {
  CheckCircleIcon,
  ChevronLeftIcon,
  HeartIcon,
  PlusIcon,
} from "@heroicons/react/outline";
import { useTranslations } from "next-intl";

import { usePlanNextWeek } from "./usePlanNextWeek";
import { PlanNextWeekDinners } from "./PlanNextWeekDinners";
import { PlanNextWeekTodos } from "./PlanNextWeekTodos";
import { Dispatch } from "react";
import { ViewAction } from "../Dashboard/useViewStack";

import { useWeeks } from "../../hooks/useWeeks";
import { useDinners } from "../../hooks/useDinners";
import { User } from "../../hooks/useCurrentUser";
import { useSuspendCaches } from "../../useCache";

export const PlanNextWeek = ({
  user,
  dispatchViewStack,
  view,
}: {
  user: User;
  dispatchViewStack: Dispatch<ViewAction>;
  view: "DINNERS" | "TODOS";
}) => {
  const [weeksCache, dinnersCache] = useSuspendCaches([
    useWeeks(user),
    useDinners(user),
  ]);
  const weeks = weeksCache.read();
  const dinners = dinnersCache.read();

  const [, { CHANGE_WEEKDAY_DINNER, TOGGLE_WEEKDAY }] = usePlanNextWeek({
    user,
    weekId: weeks.data.nextWeek.id,
  });
  const t = useTranslations("PlanWeekView");

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <div className="flex-1">
            <button
              onClick={() =>
                dispatchViewStack({
                  type: "POP_VIEW",
                })
              }
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="flex shadow-sm flex-2">
            <button
              type="button"
              onClick={() =>
                dispatchViewStack({
                  type: "REPLACE_VIEW",
                  view: {
                    name: "PLAN_NEXT_WEEK",
                    subView: "DINNERS",
                  },
                })
              }
              className="flex-1 relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <HeartIcon
                className={`mr-1 h-5 w-5 ${
                  view === "DINNERS" ? "text-red-400" : "text-gray-400"
                }`}
                aria-hidden="true"
              />
              <span>{t("dinners")}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                dispatchViewStack({
                  type: "REPLACE_VIEW",
                  view: {
                    name: "PLAN_NEXT_WEEK",
                    subView: "TODOS",
                  },
                })
              }
              className="flex-1 inline-flex -ml-px relative items-center px-4 py-2 rounded-r-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <CheckCircleIcon
                className={`mr-1 h-5 w-5 ${
                  view === "TODOS" ? "text-green-400" : "text-gray-400"
                }`}
                aria-hidden="true"
              />
              <span>{t("todos")}</span>
            </button>
          </div>
          <div className="flex-1 flex">
            <button
              className="ml-auto"
              onClick={() =>
                dispatchViewStack({
                  type: "PUSH_VIEW",
                  view:
                    view === "DINNERS"
                      ? {
                          name: "EDIT_DINNER",
                        }
                      : { name: "EDIT_TODO" },
                })
              }
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      {view === "DINNERS" ? (
        <PlanNextWeekDinners
          dinners={dinners.data}
          weekDinners={weeks.data.nextWeek.dinners}
          onChangeDinner={(weekdayIndex, dinnerId) =>
            CHANGE_WEEKDAY_DINNER({ dinnerId, weekdayIndex })
          }
        />
      ) : (
        <PlanNextWeekTodos
          user={user}
          dispatchViewStack={dispatchViewStack}
          toggleWeekday={(params) => TOGGLE_WEEKDAY(params)}
        />
      )}
    </div>
  );
};
