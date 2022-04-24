import { match } from "react-states";

import { useDashboard, viewStates } from "./useDashboard";
import { GroceriesShopping } from "../GroceriesShopping";
import { DashboardContent, DashboardSkeleton } from "./DashboardContent";
import { CheckLists } from "../CheckLists";
import { EditTodo } from "../EditTodo";
import { Dinners } from "../Dinners";
import { EditDinner } from "../EditDinner";
import { PlanNextWeek } from "../PlanNextWeek";

export const Dashboard = () => {
  const [dashboard, dispatch] = useDashboard({});

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {match(dashboard, {
        AWAITING_AUTHENTICATION: () => <DashboardSkeleton />,
        ERROR: () => <DashboardSkeleton />,
        LOADING: () => <DashboardSkeleton />,
        REQUIRING_AUTHENTICATION: () => <DashboardSkeleton />,
        LOADED: (loadedDashboard) => {
          const { viewStack, user, data, POP_VIEW, PUSH_VIEW, REPLACE_VIEW } =
            loadedDashboard;
          const view = viewStack[viewStack.length - 1];

          return match(view, {
            DASHBOARD: () => (
              <DashboardContent dashboard={[loadedDashboard, dispatch]} />
            ),
            GROCERIES_SHOPPING: () => (
              <GroceriesShopping dashboard={[loadedDashboard, dispatch]} />
            ),
            CHECKLISTS: () => (
              <CheckLists dashboard={[loadedDashboard, dispatch]} />
            ),
            PLAN_NEXT_WEEK: ({ subView }) => (
              <PlanNextWeek
                dashboard={[loadedDashboard, dispatch]}
                view={subView}
              />
            ),
            DINNERS: () => <Dinners dashboard={[loadedDashboard, dispatch]} />,
            EDIT_DINNER: ({ id }) => (
              <EditDinner
                dinner={id ? data.dinners[id] : undefined}
                onBackClick={() => {
                  dispatch(POP_VIEW());
                }}
              />
            ),
            EDIT_TODO: ({ id }) => (
              <EditTodo
                todo={id ? data.todos[id] : undefined}
                checkListItemsByTodoId={data.checkListItemsByTodoId}
                onBackClick={() => {
                  dispatch(POP_VIEW());
                }}
              />
            ),
          });
        },
      })}
    </div>
  );
};
