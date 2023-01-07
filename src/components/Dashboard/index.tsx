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

import ErrorBoundary from "../ErrorBoundary";
import { useSuspendCaches } from "../../useCache";
import { useTodos } from "../../hooks/useTodos";
import { useCurrentUser, User } from "../../hooks/useCurrentUser";

const DashboardViews = ({ user }: { user: User }) => {
  const [viewStack, dispatchViewStack] = useViewStack();
  const view = viewStack[viewStack.length - 1];
  const [dinnersCache, todosCache] = useSuspendCaches([
    useDinners(user),
    useTodos(user),
  ]);
  const dinners = dinnersCache.read().data;
  const todos = todosCache.read().data;

  const renderView = () => {
    switch (view.name) {
      case "DASHBOARD": {
        return (
          <DashboardContent user={user} dispatchViewStack={dispatchViewStack} />
        );
      }

      case "GROCERIES_SHOPPING": {
        return (
          <GroceriesShopping
            user={user}
            dispatchViewStack={dispatchViewStack}
          />
        );
      }
      case "CHECKLISTS": {
        return <CheckLists user={user} dispatchViewStack={dispatchViewStack} />;
      }
      case "PLAN_NEXT_WEEK": {
        return (
          <PlanNextWeek
            user={user}
            dispatchViewStack={dispatchViewStack}
            view={view.subView}
          />
        );
      }

      case "DINNERS": {
        return <Dinners user={user} dispatchViewStack={dispatchViewStack} />;
      }
      case "EDIT_DINNER": {
        return (
          <EditDinner
            user={user}
            initialDinner={view.id ? dinners[view.id] : undefined}
            onBackClick={() => dispatchViewStack({ type: "POP_VIEW" })}
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
};

const AuthenticatedDashboard = () => {
  const user = useCurrentUser().suspend().read();

  if (user.data) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardViews user={user.data} />
        </Suspense>
      </ErrorBoundary>
    );
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
