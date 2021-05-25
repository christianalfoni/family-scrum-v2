import { match } from "react-states";
import { useDasbhoard } from "../features/DashboardFeature";
import { GroceryListFeature } from "../features/GroceryListFeature";
import { GroceriesView } from "./GroceriesView";
import { DashboardView, DashboardContentSkeleton } from "./DashboardView";
import { ShoppingListView } from "./ShoppingListView";
import { GroceriesFeature } from "../features/GroceriesFeature";
import { PlanWeekView } from "./PlanWeekView";
import { PlanWeekFeature } from "../features/PlanWeekFeature";
import { getCurrentWeekDayId } from "../utils";

export const Dashboard = () => {
  const [dashboard, send] = useDasbhoard();

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {match(dashboard, {
        AWAITING_AUTHENTICATION: () => <DashboardContentSkeleton />,
        ERROR: () => <DashboardContentSkeleton />,
        LOADING: () => <DashboardContentSkeleton />,
        REQUIRING_AUTHENTICATION: () => <DashboardContentSkeleton />,
        LOADED: ({ family, groceries, view, tasks, week }) => {
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
              <GroceriesFeature familyUid={family.id}>
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
              <PlanWeekFeature
                familyId={family.id}
                weekId={getCurrentWeekDayId(0)}
              >
                <PlanWeekView
                  tasks={tasks}
                  family={family}
                  week={week}
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
              <PlanWeekFeature
                familyId={family.id}
                weekId={getCurrentWeekDayId(0)}
              >
                <PlanWeekView
                  tasks={tasks}
                  family={family}
                  week={week}
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
