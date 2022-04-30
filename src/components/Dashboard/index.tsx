import { match, PickState } from "react-states";

import { DashboardAction, DashboardState, useDashboard } from "./useDashboard";
import { GroceriesShopping } from "../GroceriesShopping";
import { DashboardContent, DashboardSkeleton } from "./DashboardContent";
import { CheckLists } from "../CheckLists";
import { EditTodo } from "../EditTodo";
import { Dinners } from "../Dinners";
import { EditDinner } from "../EditDinner";
import { PlanNextWeek } from "../PlanNextWeek";
import { createContext, Dispatch, useContext } from "react";

type LoadedDashboard = [
  PickState<DashboardState, "LOADED">,
  Dispatch<DashboardAction>
];

const loadedDashboardContext = createContext(
  null as unknown as LoadedDashboard
);

export const useLoadedDashboard = () => useContext(loadedDashboardContext);

export const LoadedDashboardProvider: React.FC<{
  loadedDashboard: LoadedDashboard;
}> = ({ loadedDashboard, children }) => (
  <loadedDashboardContext.Provider value={loadedDashboard}>
    {children}
  </loadedDashboardContext.Provider>
);

export const Dashboard = () => {
  const [dashboard, dispatch] = useDashboard({});

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {match(
        dashboard,
        {
          LOADED: (loadedDashboard) => {
            const { viewStack, data, POP_VIEW } = loadedDashboard;
            const view = viewStack[viewStack.length - 1];

            return (
              <LoadedDashboardProvider
                loadedDashboard={[loadedDashboard, dispatch]}
              >
                {match(view, {
                  DASHBOARD: () => <DashboardContent />,
                  GROCERIES_SHOPPING: () => <GroceriesShopping />,
                  CHECKLISTS: () => <CheckLists />,
                  PLAN_NEXT_WEEK: ({ subView }) => (
                    <PlanNextWeek view={subView} />
                  ),
                  DINNERS: () => (
                    <Dinners dashboard={[loadedDashboard, dispatch]} />
                  ),
                  EDIT_DINNER: ({ id }) => (
                    <EditDinner
                      initialDinner={id ? data.dinners[id] : undefined}
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
                })}
              </LoadedDashboardProvider>
            );
          },
        },
        (state) => (
          <DashboardSkeleton />
        )
      )}
    </div>
  );
};
