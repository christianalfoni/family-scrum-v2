import { GroceriesShopping } from "../GroceriesShopping";
import { DashboardContent, DashboardSkeleton } from "./DashboardContent";
import { CheckLists } from "../CheckLists";
import { EditTodo } from "../EditTodo";
import { Dinners } from "../Dinners";
import { EditDinner } from "../EditDinner";
import { PlanNextWeek } from "../PlanNextWeek";

import { useViewStack } from "./useViewStack";
import { Suspense } from "react";
import { useDinners } from "../../hooks/useDinners";
import { useCurrentUser, User } from "../../hooks";
import { useCacheSuspense } from "../../useCache";

const DashboardViews = ({ user }: { user: User }) => {
  const [viewStack, dispatchView] = useViewStack();
  const view = viewStack[viewStack.length - 1];

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
        return <Dinners />;
      }
      case "EDIT_DINNER": {
        return (
          <EditDinner
            initialDinner={view.id ? data.dinners[id] : undefined}
            onBackClick={() => dispatchView({ type: "POP_VIEW" })}
          />
        );
      }
      case "EDIT_TODO": {
        return (
          <EditTodo
            todo={view.id ? data.todos[view.id] : undefined}
            checkListItemsByTodoId={data.checkListItemsByTodoId}
            onBackClick={() => dispatchView({ type: "POP_VIEW" })}
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
};

const AuthenticatedDashboard = () => {
  const [user] = useCacheSuspense(useCurrentUser());

  if (user.data) {
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardViews user={user.data} />
    </Suspense>;
  }

  return <DashboardSkeleton />;
};

export const Dashboard = () => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AuthenticatedDashboard />
    </Suspense>
  );
};
