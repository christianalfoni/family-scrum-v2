import {
  ShoppingCartIcon,
  CheckIcon,
  ChatBubbleBottomCenterIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { Drawer, DrawerContent, DrawerTrigger } from "../common/Drawer";
import { MenuCard } from "./MenuCard";
import * as state from "../../state";
import { CurrentWeekCalendar } from "../CurrentWeekCalendar";

// import { CurrentWeekTodosContext } from "./CurrentWeekTodosContext";
// import { AssistantContext } from "./AssistantContext";

type Props = {
  familyScrum: state.FamilyScrum;
};

export function Dashboard({ familyScrum }: Props) {
  return (
    <>
      <ul className="flex flex-col px-6 mb-2 mt-6">
        <MenuCard to="/groceries" Icon={ShoppingCartIcon} color="bg-red-500">
          Go shopping ({familyScrum.groceries.groceries.length})
        </MenuCard>

        <MenuCard to="/checklists" Icon={CheckIcon} color="bg-blue-500">
          Checklists ({familyScrum.todos.todosWithCheckList.length})
        </MenuCard>

        <MenuCard Icon={ChatBubbleBottomCenterIcon} color="bg-green-500">
          Plan Next Week
        </MenuCard>

        <MenuCard Icon={HeartIcon} color="bg-purple-500">
          Dinners
        </MenuCard>
      </ul>

      <div className="h-2/4">
        <CurrentWeekCalendar familyScrum={familyScrum} />
      </div>

      <button
        type="button"
        onClick={() => {}}
        className="z-50 fixed right-6 bottom-14 h-14 w-14 rounded-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-lg text-sm font-medium  text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <ChatBubbleBottomCenterIcon className="w-8 h-8" />
      </button>
    </>
  );
}
