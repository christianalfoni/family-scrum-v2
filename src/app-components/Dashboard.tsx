import { match } from "react-states";
import { useDasbhoard } from "../features/DashboardFeature";
import { GroceryListFeature } from "../features/GroceryListFeature";
import { GroceriesView } from "./GroceriesView";
import { DashboardContent, DashboardContentSkeleton } from "./DashboardContent";
import { ShoppingListView } from "./ShoppingListView";
import { GroceriesFeature } from "../features/GroceriesFeature";

export const Dashboard = () => {
  const [dashboard, send] = useDasbhoard();

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {match(dashboard, {
        AWAITING_AUTHENTICATION: () => <DashboardContentSkeleton />,
        ERROR: () => <DashboardContentSkeleton />,
        LOADING: () => <DashboardContentSkeleton />,
        REQUIRING_AUTHENTICATION: () => <DashboardContentSkeleton />,
        LOADED: ({ family, groceries, view }) => {
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
            WEEKDAYS: () => <DashboardContent />,
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
          });
        },
      })}
    </div>
  );
};
