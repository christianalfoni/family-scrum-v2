import { useGlobalContext } from "../useGlobalContext";
import { CheckLists } from "./CheckLists";
import { Dashboard } from "./Dashboard";
import { Skeleton } from "./Dashboard/Skeleton";
import { Groceries } from "./Groceries";
import { PlanNextWeek } from "./PlanNextWeek";
import { SignInModal } from "./SignInModal";
import { useAppContext } from "./useAppContext";
import { observer } from "impact-signal";
import { Suspense } from "react";

export const App: React.FC = () => {
  using _ = observer();

  const { authentication, views } = useGlobalContext();

  if (authentication.state.status === "AUTHENTICATING") {
    return <Skeleton />;
  }

  if (authentication.state.status === "UNAUTHENTICATED") {
    return (
      <>
        <Skeleton />
        <SignInModal />
      </>
    );
  }

  const renderView = () => {
    const view = views.current;

    switch (view.name) {
      case "DASHBOARD": {
        return <Dashboard />;
      }
      case "GROCERIES_SHOPPING": {
        return <Groceries />;
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
    <useAppContext.Provider
      key={authentication.state.user.id}
      user={authentication.state.user}
      family={authentication.state.family}
    >
      <Suspense fallback={<Skeleton />}>
        <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
          {renderView()}
        </div>
      </Suspense>
    </useAppContext.Provider>
  );
};
