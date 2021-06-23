import { match } from "react-states";
import { useDasbhoard } from "../features/DashboardFeature";
import { GroceriesView } from "./GroceriesView";
import { GroceriesShoppingView } from "./GroceriesShoppingView";
import { DashboardView, DashboardContentSkeleton } from "./DashboardView";

import { GroceriesFeature } from "../features/GroceriesFeature";
import { DinnersFeature } from "../features/DinnersFeature";
import { GroceriesShoppingFeature } from "../features/GroceriesShoppingFeature";
import { PlanNextWeekTodos } from "./PlanNextWeekTodos";
import { PlanNextWeekDinners } from "./PlanNextWeekDinners";
import { CheckListsView } from "./CheckListsView";
import { PlanWeekFeature } from "../features/PlanWeekFeature";
import { AddTodoFeature } from "../features/AddTodoFeature";
import { AddTodoView } from "./AddTodoView";
import { CaptureFeature } from "../features/CaptureFeature";
import { CheckListFeature } from "../features/CheckListFeature";
import { DinnersView } from "./DinnersView";
import { AddDinnerView } from "./AddDinnerView";

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
          dinners,
          user,
          checkListItemsByTodoId,
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
            CHECKLISTS: () => (
              <CheckListFeature user={user}>
                <CheckListsView
                  todos={todos}
                  checkListItemsByTodoId={checkListItemsByTodoId}
                  onBackClick={() =>
                    send({
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
                      send({
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
                      send({
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
                    send({
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
              <DinnersFeature>
                <AddDinnerView
                  onBackClick={() => {
                    send({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "DINNERS",
                      },
                    });
                  }}
                />
              </DinnersFeature>
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
