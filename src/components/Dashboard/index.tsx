import { match } from "react-states";

import { useDashboard } from "./useDashboard";
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
          const { view, todos, dinners, user, checkListItemsByTodoId } =
            loadedDashboard;

          return match(view, {
            DASHBOARD: () => (
              <DashboardContent
                dashboard={loadedDashboard}
                selectView={(view) => {
                  dispatch({
                    type: "VIEW_SELECTED",
                    view,
                  });
                }}
              />
            ),
            GROCERIES_SHOPPING: () => (
              <GroceriesShopping
                dashboard={loadedDashboard}
                onBackClick={() =>
                  dispatch({
                    type: "VIEW_SELECTED",
                    view: {
                      state: "DASHBOARD",
                    },
                  })
                }
              />
            ),

            CHECKLISTS: () => (
              <CheckLists
                todos={todos}
                user={user}
                checkListItemsByTodoId={checkListItemsByTodoId}
                onBackClick={() =>
                  dispatch({
                    type: "VIEW_SELECTED",
                    view: {
                      state: "DASHBOARD",
                    },
                  })
                }
                onTodoClick={(id) => {
                  dispatch({
                    type: "VIEW_SELECTED",
                    view: {
                      state: "EDIT_TODO",
                      id,
                    },
                  });
                }}
              />
            ),
            PLAN_NEXT_WEEK: () => (
              <PlanNextWeek
                onTodoClick={(id) => {
                  dispatch({
                    type: "VIEW_SELECTED",
                    view: {
                      state: "EDIT_TODO",
                      id,
                    },
                  });
                }}
                dashboard={loadedDashboard}
                user={user}
                onBackClick={() =>
                  dispatch({
                    type: "VIEW_SELECTED",
                    view: {
                      state: "DASHBOARD",
                    },
                  })
                }
              />
            ),
            DINNERS: () => (
              <Dinners
                dinners={dinners}
                onDinnerClick={(id) => {
                  dispatch({
                    type: "VIEW_SELECTED",
                    view: {
                      state: "EDIT_DINNER",
                      id,
                    },
                  });
                }}
                onAddDinnerClick={() => {
                  dispatch({
                    type: "VIEW_SELECTED",
                    view: {
                      state: "EDIT_DINNER",
                    },
                  });
                }}
                onBackClick={() => {
                  dispatch({
                    type: "VIEW_SELECTED",
                    view: {
                      state: "DASHBOARD",
                    },
                  });
                }}
              />
            ),
            EDIT_DINNER: ({ id }) => (
              <EditDinner
                dinner={id ? dinners[id] : undefined}
                onBackClick={() => {
                  dispatch({
                    type: "VIEW_SELECTED",
                    view: {
                      state: "DINNERS",
                    },
                  });
                }}
              />
            ),
            EDIT_TODO: ({ id }) => (
              <EditTodo
                todo={id ? todos[id] : undefined}
                checkListItemsByTodoId={checkListItemsByTodoId}
                onBackClick={() => {
                  dispatch({
                    type: "VIEW_SELECTED",
                    view: {
                      state: "DASHBOARD",
                    },
                  });
                }}
              />
            ),
          });
        },
      })}
    </div>
  );
};
