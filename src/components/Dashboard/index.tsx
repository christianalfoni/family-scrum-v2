import { GroceriesShopping } from "../GroceriesShopping";
import { DashboardContent } from "./DashboardContent";
import { CheckLists } from "../CheckLists";
import { EditTodo } from "../EditTodo";
import { Dinners } from "../Dinners";
import { EditDinner } from "../EditDinner";
import { PlanNextWeek } from "../PlanNextWeek";
import { User } from "../../hooks/useCurrentUser";
import { observe, useStore } from "impact-app";
import { ViewStackStore } from "../../stores/ViewStackStore";

export const Dashboard = observe(({ user }: { user: User }) => {
  const viewStackStore = useStore(ViewStackStore);
  const view = viewStackStore.current;

  const renderView = () => {
    switch (view.name) {
      case "DASHBOARD": {
        return <DashboardContent />;
      }

      case "GROCERIES_SHOPPING": {
        return <GroceriesShopping user={user} />;
      }
      case "CHECKLISTS": {
        return <CheckLists user={user} />;
      }
      case "PLAN_NEXT_WEEK": {
        return <PlanNextWeek user={user} view={view.subView} />;
      }

      case "DINNERS": {
        return <Dinners user={user} />;
      }
      case "EDIT_DINNER": {
        return (
          <EditDinner
            user={user}
            initialDinner={view.id ? dinners[view.id] : undefined}
          />
        );
      }
      case "EDIT_TODO": {
        return (
          <EditTodo
            user={user}
            todo={view.id ? todos[view.id] : undefined}
            onBackClick={() => dispatchViewStack({ type: "POP_VIEW" })}
          />
        );
      }
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {renderView()}
    </div>
  );
});
