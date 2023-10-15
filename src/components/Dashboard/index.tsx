import { GroceriesShopping } from "../GroceriesShopping";
import { DashboardContent, DashboardSkeleton } from "./DashboardContent";
import { CheckLists } from "../CheckLists";
import { EditTodo } from "../EditTodo";
import { Dinners } from "../Dinners";
import { EditDinner } from "../EditDinner";
import { PlanNextWeek } from "../PlanNextWeek";

import { observe } from "impact-app";
import { useViewStack } from "../../stores/ViewStackStore";
import { Suspense } from "react";

export const Dashboard = observe(() => {
  const viewStack = useViewStack();
  const view = viewStack.current;

  const renderView = () => {
    switch (view.name) {
      case "DASHBOARD": {
        return <DashboardContent />;
      }

      case "GROCERIES_SHOPPING": {
        return <GroceriesShopping />;
      }
      case "CHECKLISTS": {
        return <CheckLists />;
      }
      case "PLAN_NEXT_WEEK": {
        return <PlanNextWeek view={view.subView} />;
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
      <Suspense fallback={<DashboardSkeleton />}>{renderView()}</Suspense>
    </div>
  );
});
