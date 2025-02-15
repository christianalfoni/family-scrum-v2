import {
  ShoppingCartIcon,
  CheckIcon,
  ChatBubbleBottomCenterIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";

import { Drawer, DrawerContent, DrawerTrigger } from "../common/Drawer";

import { MenuCard } from "./MenuCard";
import { useDashboard, useFamilyScrum } from "../../state";

// import { CurrentWeekTodosContext } from "./CurrentWeekTodosContext";
// import { AssistantContext } from "./AssistantContext";

export const Dashboard = () => {
  const familyScrum = useFamilyScrum();
  const dashboard = useDashboard();

  console.log(familyScrum);

  return (
    <Drawer>
      <ul className="flex flex-col px-6 mb-2 mt-6">
        <MenuCard
          Icon={ShoppingCartIcon}
          onClick={() => {
            /*
            familyScrum.push({
              name: "GROCERIES_SHOPPING",
            });
            */
          }}
          color="bg-red-500"
        >
          Go shopping ( 0 )
        </MenuCard>

        <MenuCard
          Icon={CheckIcon}
          onClick={() => {
            views.push({
              name: "CHECKLISTS",
            });
          }}
          color="bg-blue-500"
        >
          Checklists ( 0 )
        </MenuCard>

        <MenuCard
          Icon={ChatBubbleBottomCenterIcon}
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

      <div className="h-2/4">{/*<CurrentWeekTodosContext />*/}</div>

      <DrawerTrigger asChild>
        <button
          type="button"
          onClick={() => {
            return;
            views.push({
              name: "EDIT_TODO",
            });
          }}
          className="z-50 fixed right-6 bottom-14 h-14 w-14 rounded-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-lg text-sm font-medium  text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <ChatBubbleBottomCenterIcon className="w-8 h-8" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-white">
        {/*<AssistantContext />*/}
      </DrawerContent>
    </Drawer>
  );
};
