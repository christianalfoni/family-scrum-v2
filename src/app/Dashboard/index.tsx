import {
  ShoppingCartIcon,
  ChatBubbleBottomCenterIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/solid";

import { useFamilyScrum } from "../FamilyScrumContext";

import { CurrentWeekCalendar } from "../CurrentWeekCalendar";
import { Divider } from "@/components/divider";
import { Button } from "@/components/button";
import { Link } from "react-router";
import { Heading } from "@/components/heading";

// import { AssistantContext } from "./AssistantContext";

export function Dashboard() {
  const familyScrum = useFamilyScrum();
  const groceriesCount = Object.values(familyScrum.groceries.groceries).length;

  return (
    <>
      <div>
        <Link to="/todos/new">
          <div className="flex items-center h-16">
            <Button color="orange" className="w-full flex">
              <DocumentPlusIcon className="h-8 w-8 mr-2" />
              Add New Todo
              <span className="flex-1" />
              <ArrowRightIcon className="ml-auto h-6 w-6" />
            </Button>
          </div>
        </Link>

        <div className="flex items-center h-16">
          <Button color="rose" className="w-full flex">
            <ShoppingCartIcon className="h-8 w-8 mr-2" />
            Groceries <span className="font-normal">({groceriesCount})</span>
            <span className="flex-1" />
            <ArrowRightIcon className="ml-auto h-6 w-6" />
          </Button>
        </div>

        <div className="flex items-center h-16">
          <Button color="sky" className="w-full flex">
            <ClipboardDocumentCheckIcon className="h-8 w-8 mr-2" />
            Checklists{" "}
            <span className="font-normal">
              ({familyScrum.todos.todosWithCheckList.length})
            </span>
            <span className="flex-1" />
            <ArrowRightIcon className="ml-auto h-6 w-6" />
          </Button>
        </div>

        <div className="flex items-center h-16">
          <Button color="teal" className="w-full flex">
            <ChatBubbleBottomCenterIcon className="h-8 w-8 mr-2" />
            Plan Next Week
            <span className="flex-1" />
            <ArrowRightIcon className="ml-auto h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="h-2/4 mt-4">
        <CurrentWeekCalendar />
      </div>
    </>
  );
}
