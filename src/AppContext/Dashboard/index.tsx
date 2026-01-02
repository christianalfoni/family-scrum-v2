import {
  ChatAlt2Icon,
  ChatIcon,
  ClipboardCheckIcon,
  HeartIcon,
  PencilAltIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";
import { useTranslations } from "next-intl";
import { signal } from "impact-app";
import { Timestamp } from "firebase/firestore";

import { Drawer, DrawerTrigger } from "@/components/ui/drawer";

import { useAppContext } from "../useAppContext";
import { useGlobalContext } from "../../useGlobalContext";
import { GroceryDTO } from "../../useGlobalContext/firebase";

import { MenuCard } from "./MenuCard";

import { CurrentWeekTodosContext } from "./CurrentWeekTodosContext";

const newGroceryInput = signal("");

export const Dashboard = () => {
  const { views, firebase } = useGlobalContext();
  const { fetchGroceries, todosWithCheckList, user } = useAppContext();

  const t = useTranslations("DashboardView");

  const groceriesPromise = fetchGroceries();
  const groceriesCollection = firebase.collections.groceries(user.familyId);

  const addGrocery = () => {
    const name = newGroceryInput.value;
    newGroceryInput.value = "";

    const grocery: GroceryDTO = {
      id: firebase.createId(groceriesCollection),
      name,
      created: Timestamp.fromDate(new Date()),
      modified: Timestamp.fromDate(new Date()),
    };

    firebase
      .setDoc(groceriesCollection, {
        ...grocery,
        created: firebase.createServerTimestamp(),
        modified: firebase.createServerTimestamp(),
      })
      .catch((error) => {
        newGroceryInput.value = name;
        throw error;
      });
  };

  return (
    <Drawer>
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="w-full">
          <input
            id="quick-grocery"
            name="quick-grocery"
            value={newGroceryInput.value}
            onChange={(event) => (newGroceryInput.value = event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && newGroceryInput.value.trim()) {
                addGrocery();
              }
            }}
            className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
            placeholder={t("newGrocery") as string}
            type="text"
          />
        </div>
        <span className="ml-3">
          <button
            type="button"
            className="disabled:opacity-50 bg-white whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
            {...(newGroceryInput.value.trim()
              ? {
                  disabled: false,
                  onClick: () => addGrocery(),
                }
              : { disabled: true, onClick: undefined })}
          >
            <PlusIcon
              className="-ml-2 mr-1 h-5 text-gray-400"
              aria-hidden="true"
            />
            <span>{t("add")}</span>
          </button>
        </span>
      </div>

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
          {groceriesPromise.status === "fulfilled"
            ? groceriesPromise.value.length
            : 0}
          )
        </MenuCard>

        <MenuCard
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
        <CurrentWeekTodosContext />
      </div>

      <DrawerTrigger asChild>
        <button
          type="button"
          onClick={() => {
            views.push({
              name: "EDIT_TODO",
            });
          }}
          className="z-50 fixed right-6 bottom-14 h-14 w-14 rounded-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-lg text-sm font-medium  text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <PencilAltIcon className="w-8 h-8" />
        </button>
      </DrawerTrigger>
    </Drawer>
  );
};
