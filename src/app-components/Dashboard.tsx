import { match } from "react-states";
import { useDasbhoard } from "../features/DashboardFeature";
import { GroceriesView } from "./GroceriesView";
import { GroceriesShoppingView } from "./GroceriesShoppingView";
import { DashboardView, DashboardContentSkeleton } from "./DashboardView";

import { GroceriesFeature } from "../features/GroceriesFeature";
import { GroceriesShoppingFeature } from "../features/GroceriesShoppingFeature";
import { PlanWeekView } from "./PlanWeekView";
import { TodosView } from "./TodosView";
import { PlanWeekFeature } from "../features/PlanWeekFeature";
import { AddTodoFeature } from "../features/AddTodoFeature";
import { AddTodoView } from "./AddTodoView";
import { CaptureFeature } from "../features/CaptureFeature";
import { TodosFeature } from "../features/TodosFeature";

export const Dashboard = () => {
  const [dashboard, send] = useDasbhoard();

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {match(dashboard, {
        AWAITING_AUTHENTICATION: () => <DashboardContentSkeleton />,
        ERROR: () => <DashboardContentSkeleton />,
        LOADING: () => <DashboardContentSkeleton />,
        REQUIRING_AUTHENTICATION: () => <DashboardContentSkeleton />,
        LOADED: ({
          family,
          view,
          todos,
          currentWeek,
          nextWeek,
          previousWeek,
          user,
        }) => {
          return match(view, {
            GROCERIES_SHOPPING: () => (
              <GroceriesShoppingFeature familyId={family.id}>
                <GroceriesShoppingView
                  onBackClick={() =>
                    send({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "WEEKDAYS",
                      },
                    })
                  }
                />
              </GroceriesShoppingFeature>
            ),
            GROCERIES: () => (
              <GroceriesFeature familyId={family.id}>
                <CaptureFeature familyId={family.id}>
                  <GroceriesView
                    onBackClick={() =>
                      send({
                        type: "VIEW_SELECTED",
                        view: {
                          state: "WEEKDAYS",
                        },
                      })
                    }
                  />
                </CaptureFeature>
              </GroceriesFeature>
            ),
            WEEKDAYS: () => <DashboardView />,
            TODOS: () => (
              <TodosFeature user={user}>
                <TodosView
                  todos={todos}
                  onBackClick={() =>
                    send({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "WEEKDAYS",
                      },
                    })
                  }
                />
              </TodosFeature>
            ),
            PLAN_CURRENT_WEEK: () => (
              <TodosFeature user={user}>
                <PlanWeekFeature user={user} weekId={currentWeek.id}>
                  <PlanWeekView
                    user={user}
                    todos={todos}
                    family={family}
                    previousWeek={previousWeek}
                    week={currentWeek}
                    onBackClick={() =>
                      send({
                        type: "VIEW_SELECTED",
                        view: {
                          state: "WEEKDAYS",
                        },
                      })
                    }
                  />
                </PlanWeekFeature>
              </TodosFeature>
            ),
            PLAN_NEXT_WEEK: () => (
              <TodosFeature user={user}>
                <PlanWeekFeature user={user} weekId={nextWeek.id}>
                  <PlanWeekView
                    user={user}
                    todos={todos}
                    family={family}
                    previousWeek={currentWeek}
                    week={nextWeek}
                    onBackClick={() =>
                      send({
                        type: "VIEW_SELECTED",
                        view: {
                          state: "WEEKDAYS",
                        },
                      })
                    }
                  />
                </PlanWeekFeature>
              </TodosFeature>
            ),
            ADD_TODO: () => (
              <AddTodoFeature familyId={family.id} userId={user.id}>
                <AddTodoView
                  onBackClick={() => {
                    send({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "WEEKDAYS",
                      },
                    });
                  }}
                />
              </AddTodoFeature>
            ),
          });
        },
      })}
    </div>
  );
};
