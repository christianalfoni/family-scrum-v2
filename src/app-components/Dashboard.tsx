import { match } from "react-states";
import { useDasbhoard } from "../features/DashboardFeature";
import { ShoppingListFeature } from "../features/ShoppingListFeature";
import { GroceriesView } from "./GroceriesView";
import { DashboardView, DashboardContentSkeleton } from "./DashboardView";
import { ShoppingListView } from "./ShoppingListView";
import { GroceriesFeature } from "../features/GroceriesFeature";
import { PlanWeekView } from "./PlanWeekView";
import { PlanWeekFeature } from "../features/PlanWeekFeature";
import { AddTodoFeature } from "../features/AddTodoFeature";
import { AddTodoView } from "./AddTodoView";

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
          groceries,
          view,
          todos,
          currentWeek,
          nextWeek,
          previousWeek,
          events,
          user,
        }) => {
          return match(view, {
            SHOPPING_LIST: () => (
              <ShoppingListFeature familyId={family.id}>
                <ShoppingListView
                  groceries={groceries}
                  onBackClick={() =>
                    send({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "WEEKDAYS",
                      },
                    })
                  }
                />
              </ShoppingListFeature>
            ),
            WEEKDAYS: () => <DashboardView />,
            GROCERIES: () => (
              <GroceriesFeature familyId={family.id}>
                <GroceriesView
                  groceries={groceries}
                  onBackClick={() =>
                    send({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "WEEKDAYS",
                      },
                    })
                  }
                />
              </GroceriesFeature>
            ),
            PLAN_CURRENT_WEEK: () => (
              <PlanWeekFeature user={user} weekId={currentWeek.id}>
                <PlanWeekView
                  user={user}
                  title="Current"
                  events={events}
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
            ),
            PLAN_NEXT_WEEK: () => (
              <PlanWeekFeature user={user} weekId={nextWeek.id}>
                <PlanWeekView
                  user={user}
                  title="Next"
                  events={events}
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
