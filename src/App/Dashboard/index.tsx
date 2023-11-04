import {
  ChatAlt2Icon,
  ClipboardCheckIcon,
  HeartIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";
import { useTranslations } from "next-intl";
import React, { Suspense } from "react";

import { useAppContext } from "../useAppContext";
import { useGlobalContext } from "../../useGlobalContext";
import { observer } from "impact-signal";
import { MenuCard } from "./MenuCard";

import { useDashboardContext } from "./useDashboardContext";
import { CurrentWeekTodos } from "./CurrentWeekTodos";

export const DashboardContent = () => {
  using _ = observer();

  const t = useTranslations("DashboardView");

  const { views } = useGlobalContext();
  const { groceriesPromise: groceries, todosWithCheckList } = useAppContext();

  return (
    <>
      <ul className="flex flex-col px-6 mb-2 mt-6">
        <MenuCard
          Icon={ShoppingCartIcon}
          onClick={() => {
            views.push({
              name: "GROCERIES_SHOPPING",
            });
          }}
          color="bg-red-500"
        >
          {t("goShopping")} (
          {groceries.status === "fulfilled" ? groceries.value.length : 0})
        </MenuCard>

        <MenuCard
          disabled={!todosWithCheckList.length}
          Icon={ClipboardCheckIcon}
          onClick={() => {
            views.push({
              name: "CHECKLISTS",
            });
          }}
          color="bg-blue-500"
        >
          {t("checkLists")} ( {todosWithCheckList.length} )
        </MenuCard>

        <MenuCard
          Icon={ChatAlt2Icon}
          onClick={() => {
            views.push({
              name: "PLAN_NEXT_WEEK",
              subView: "TODOS",
            });
          }}
          color="bg-green-500"
        >
          {t("planNextWeek")}
        </MenuCard>

        <MenuCard
          Icon={HeartIcon}
          onClick={() => {
            views.push({
              name: "DINNERS",
            });
          }}
          color="bg-purple-500"
        >
          {t("dinners")}
        </MenuCard>
      </ul>

      <div className="h-2/4">
        <Suspense fallback={null}>
          <CurrentWeekTodos />
        </Suspense>
        <button
          type="button"
          onClick={() => {
            views.push({
              name: "EDIT_TODO",
            });
          }}
          className="z-50 fixed right-6 bottom-14 h-14 w-14 rounded-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-lg text-sm font-medium  text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
    </>
  );
};

export function Dashboard() {
  return (
    <useDashboardContext.Provider>
      <DashboardContent />
    </useDashboardContext.Provider>
  );
}
