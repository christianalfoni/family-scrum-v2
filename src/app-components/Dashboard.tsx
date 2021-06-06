import { match } from "react-states";
import { useTranslations } from "next-intl";
import { useDasbhoard } from "../features/DashboardFeature";
import { ShoppingListsFeature } from "../features/ShoppingListsFeature";
import { EditGroceriesShoppingList } from "./EditGroceriesShoppingList";
import { DashboardView, DashboardContentSkeleton } from "./DashboardView";
import { ShoppingListsView } from "./ShoppingListsView";
import { EditGroceriesShoppingFeature } from "../features/EditGroceriesShoppingFeature";
import { PlanWeekView } from "./PlanWeekView";
import { PlanWeekFeature } from "../features/PlanWeekFeature";
import { AddTodoFeature } from "../features/AddTodoFeature";
import { AddTodoView } from "./AddTodoView";

export const Dashboard = () => {
  const [dashboard, send] = useDasbhoard();
  const t = useTranslations("Dashboard");

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
          events,
          user,
        }) => {
          return match(view, {
            SHOPPING_LISTS: () => (
              <ShoppingListsFeature familyId={family.id}>
                <ShoppingListsView
                  familyId={family.id}
                  onBackClick={() =>
                    send({
                      type: "VIEW_SELECTED",
                      view: {
                        state: "WEEKDAYS",
                      },
                    })
                  }
                />
              </ShoppingListsFeature>
            ),
            WEEKDAYS: () => <DashboardView />,
            PLAN_CURRENT_WEEK: () => (
              <PlanWeekFeature user={user} weekId={currentWeek.id}>
                <PlanWeekView
                  user={user}
                  title={t("thisWeek") as string}
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
                  title={t("nextWeek") as string}
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
