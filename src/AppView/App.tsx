import { useGlobalStore } from "@/stores/GlobalStore";
import { CheckLists } from "./CheckLists";
import { Dashboard } from "./Dashboard";
import { Dinners } from "./Dinners";
import { EditDinnerContext } from "./EditDinnerContext";
import { EditTodoContext } from "./EditTodoContext";
import { GroceriesContext } from "./GroceriesContext";
import { PlanNextWeek } from "./PlanNextWeek";

export function App() {
  const { views } = useGlobalStore();

  const view = views.current;
  let content: JSX.Element;

  switch (view.name) {
    case "DASHBOARD": {
      content = <Dashboard />;
      break;
    }
    case "GROCERIES_SHOPPING": {
      content = <GroceriesContext />;
      break;
    }
    case "CHECKLISTS": {
      content = <CheckLists />;
      break;
    }
    case "PLAN_NEXT_WEEK": {
      content = <PlanNextWeek view={view.subView} />;
      break;
    }

    case "DINNERS": {
      content = <Dinners />;
      break;
    }
    case "EDIT_DINNER": {
      content = <EditDinnerContext dinner={view.dinner} />;
      break;
    }
    case "EDIT_TODO": {
      content = <EditTodoContext todo={view.todo} />;
      break;
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {content}
    </div>
  );
}
