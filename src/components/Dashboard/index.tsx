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
          const { viewStack, todos, dinners, user, checkListItemsByTodoId } =
            loadedDashboard;
          const view = viewStack[viewStack.length - 1];

          return match(view, {
            DASHBOARD: () => (
              <DashboardContent
                dashboard={loadedDashboard}
                selectView={(view) => {
                  dispatch({
                    type: "PUSH_VIEW",
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
                    type: "POP_VIEW",
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
                    type: "POP_VIEW",
                  })
                }
                onTodoClick={(id) => {
                  dispatch({
                    type: "PUSH_VIEW",
                    view: {
                      state: "EDIT_TODO",
                      id,
                    },
                  });
                }}
              />
            ),
            PLAN_NEXT_WEEK: ({ subView }) => (
              <PlanNextWeek
                view={subView}
                onTodoClick={(id) => {
                  dispatch({
                    type: "PUSH_VIEW",
                    view: {
                      state: "EDIT_TODO",
                      id,
                    },
                  });
                }}
                onPlanDinnersClick={() => {
                  dispatch({
                    type: "REPLACE_VIEW",
                    view: {
                      state: "PLAN_NEXT_WEEK",
                      subView: "DINNERS",
                    },
                  });
                }}
                onPlanTodosClick={() => {
                  dispatch({
                    type: "REPLACE_VIEW",
                    view: {
                      state: "PLAN_NEXT_WEEK",
                      subView: "TODOS",
                    },
                  });
                }}
                dashboard={loadedDashboard}
                user={user}
                onBackClick={() =>
                  dispatch({
                    type: "POP_VIEW",
                  })
                }
              />
            ),
            DINNERS: () => (
              <Dinners
                dinners={dinners}
                onDinnerClick={(id) => {
                  dispatch({
                    type: "PUSH_VIEW",
                    view: {
                      state: "EDIT_DINNER",
                      id,
                    },
                  });
                }}
                onAddDinnerClick={() => {
                  dispatch({
                    type: "PUSH_VIEW",
                    view: {
                      state: "EDIT_DINNER",
                    },
                  });
                }}
                onBackClick={() => {
                  dispatch({
                    type: "POP_VIEW",
                  });
                }}
              />
            ),
            EDIT_DINNER: ({ id }) => (
              <EditDinner
                dinner={id ? dinners[id] : undefined}
                onBackClick={() => {
                  dispatch({
                    type: "POP_VIEW",
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
                    type: "POP_VIEW",
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
