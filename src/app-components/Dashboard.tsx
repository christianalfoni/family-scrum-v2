import { match } from "react-states";
import { useDasbhoard } from "../features/DashboardFeature";
import { GroceryListFeature } from "../features/GroceryListFeature";
import { GroceriesView } from "./GroceriesView";
import { DashboardView, DashboardContentSkeleton } from "./DashboardView";
import { ShoppingListView } from "./ShoppingListView";
import { GroceriesFeature } from "../features/GroceriesFeature";
import { PlanWeekView } from "./PlanWeekView";
import { PlanWeekFeature } from "../features/PlanWeekFeature";
import { getCurrentWeekId } from "../utils";

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
          tasks,
          currentWeek,
          nextWeek,
          user,
        }) => {
          return match(view, {
            SHOPPING_LIST: () => (
              <GroceryListFeature familyId={family.id}>
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
              </GroceryListFeature>
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
                  tasks={tasks}
                  family={family}
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
                  tasks={tasks}
                  family={family}
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
          });
        },
      })}
    </div>
  );
};
