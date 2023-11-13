import { useGlobalContext } from "../useGlobalContext";
import { CheckLists } from "./CheckLists";
import { Dashboard } from "./Dashboard";
import { Skeleton } from "./Dashboard/Skeleton";
import { Dinners } from "./Dinners";
import { EditDinner } from "./EditDinner";
import { EditTodo } from "./EditTodo";
import { Groceries } from "./Groceries";
import { PlanNextWeek } from "./PlanNextWeek";
import { SignInModal } from "./SignInModal";
import { useAppContext } from "./useAppContext";

import { Suspense } from "react";

export const App: React.FC = () => {
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

  const view = views.current;
  let content: JSX.Element;

  switch (view.name) {
    case "DASHBOARD": {
      content = <Dashboard />;
      break;
    }
    case "GROCERIES_SHOPPING": {
      content = <Groceries />;
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
      content = <EditDinner dinner={view.dinner} />;
      break;
    }
    case "EDIT_TODO": {
      content = <EditTodo todo={view.todo} />;
      break;
    }
  }

  return (
    <useAppContext.Provider
      key={authentication.state.user.id}
      user={authentication.state.user}
      family={authentication.state.family}
    >
      <Suspense fallback={<Skeleton />}>
        <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
          {content}
        </div>
      </Suspense>
    </useAppContext.Provider>
  );
};
