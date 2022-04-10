import { match } from "react-states";
import { useDasbhoard } from "../features/DashboardFeature";
import { GroceriesShoppingView } from "./GroceriesShoppingView";
import { DashboardView, DashboardContentSkeleton } from "./DashboardView";

import { DinnersFeature } from "../features/DinnersFeature";
import { DinnerFeature } from "../features/DinnerFeature";
import { GroceriesShoppingFeature } from "../features/GroceriesShoppingFeature";
import { PlanNextWeekTodos } from "./PlanNextWeekTodos";
import { PlanNextWeekDinners } from "./PlanNextWeekDinners";
import { CheckListsView } from "./CheckListsView";
import { PlanWeekFeature } from "../features/PlanWeekFeature";
import { AddTodoFeature } from "../features/AddTodoFeature";
import { AddTodoView } from "./AddTodoView";

import { CheckListFeature } from "../features/CheckListFeature";
import { DinnersView } from "./DinnersView";
import { AddDinnerView } from "./AddDinnerView";

export const Dashboard = () => {
  const [dashboard, dispatch] = useDasbhoard();

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {match(dashboard, {
        AWAITING_AUTHENTICATION: () => <DashboardContentSkeleton />,
        ERROR: () => <DashboardContentSkeleton />,
        LOADING: () => <DashboardContentSkeleton />,
        REQUIRING_AUTHENTICATION: () => <DashboardContentSkeleton />,
        LOADED: (loadedDashboard) => {
          const {
            family,
            view,
            todos,
            currentWeek,
            nextWeek,
            dinners,
            groceries,
            user,
            checkListItemsByTodoId,
          } = loadedDashboard;
          return match(view, {
            GROCERIES_SHOPPING: () => (
              <GroceriesShoppingFeature
                familyId={family.id}
                dashboard={loadedDashboard}
              >
                <GroceriesShoppingView
                  dashboard={loadedDashboard}
                  onBackClick={() =>
                    dispatch({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "WEEKDAYS",
                      },
                    })
                  }
                />
              </GroceriesShoppingFeature>
            ),
            WEEKDAYS: () => (
              <DashboardView
                dashboard={loadedDashboard}
                selectView={(view) => {
                  dispatch({
                    type: "VIEW_SELECTED",
                    view,
                  });
                }}
              />
            ),
            CHECKLISTS: () => (
              <CheckListFeature user={user}>
                <CheckListsView
                  todos={todos}
                  checkListItemsByTodoId={checkListItemsByTodoId}
                  onBackClick={() =>
                    dispatch({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "WEEKDAYS",
                      },
                    })
                  }
                />
              </CheckListFeature>
            ),
            PLAN_NEXT_WEEK_DINNERS: () => (
              <CheckListFeature user={user}>
                <PlanWeekFeature user={user} weekId={nextWeek.id}>
                  <PlanNextWeekDinners
                    dinners={dinners}
                    onBackClick={() =>
                      dispatch({
                        type: "VIEW_SELECTED",
                        view: {
                          state: "WEEKDAYS",
                        },
                      })
                    }
                  />
                </PlanWeekFeature>
              </CheckListFeature>
            ),
            PLAN_NEXT_WEEK_TODOS: () => (
              <CheckListFeature user={user}>
                <PlanWeekFeature user={user} weekId={nextWeek.id}>
                  <PlanNextWeekTodos
                    user={user}
                    todos={todos}
                    checkListItemsByTodoId={checkListItemsByTodoId}
                    family={family}
                    previousWeek={currentWeek}
                    week={nextWeek}
                    onBackClick={() =>
                      dispatch({
                        type: "VIEW_SELECTED",
                        view: {
                          state: "WEEKDAYS",
                        },
                      })
                    }
                  />
                </PlanWeekFeature>
              </CheckListFeature>
            ),
            DINNERS: () => (
              <DinnersFeature>
                <DinnersView
                  onBackClick={() => {
                    dispatch({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "WEEKDAYS",
                      },
                    });
                  }}
                />
              </DinnersFeature>
            ),
            ADD_DINNER: () => (
              <DinnerFeature>
                <AddDinnerView
                  groceries={groceries}
                  onBackClick={() => {
                    dispatch({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "DINNERS",
                      },
                    });
                  }}
                />
              </DinnerFeature>
            ),
            ADD_TODO: () => (
              <AddTodoFeature familyId={family.id} userId={user.id}>
                <AddTodoView
                  onBackClick={() => {
                    dispatch({
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
