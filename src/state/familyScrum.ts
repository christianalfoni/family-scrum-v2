import { reactive } from "bonsify";
import { createDashboard, Dashboard } from "./dashboard";
import { Context } from "../context";
import { SessionAuthenticated } from "./session";
import { createGroceries, GroceriesState } from "./groceries";
import { createData } from "./data";

export type View =
  | {
      name: "dashboard";
      state: Dashboard;
    }
  | {
      name: "groceries";
      state: GroceriesState;
    };

export type FamilyScrumState = {
  session: SessionAuthenticated;
  view: View;
  back(): void;
  dispose(): void;
};

export const createFamilyScrum = (
  context: Context,
  session: SessionAuthenticated
) => {
  const data = createData(context, session);
  const familyScrum = reactive<FamilyScrumState>({
    session,
    get view(): View {
      return viewStack[viewStack.length - 1];
    },
    back() {
      viewStack.pop();
    },
    dispose() {
      data.unsubscribe();
    },
  });
  const viewStates = {
    dashboard: createDashboard(context, familyScrum),
    groceries: createGroceries(context, familyScrum, data),
  };
  const viewStack = reactive<View[]>([
    {
      name: "dashboard",
      state: viewStates.dashboard,
    },
  ]);

  return familyScrum;
};
