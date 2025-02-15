import { reactive } from "bonsify";
import { createDashboard, Dashboard } from "./dashboard";
import { Utils } from ".";
import { FamilyDTO, GroceryDTO, UserDTO } from "../utils/firebase";

export type Views = {
  name: "dashboard";
  state: Dashboard;
};

export type FamilyScrum = {
  user: UserDTO;
  family: FamilyDTO;
  view: Views;
  groceries: GroceryDTO[];
  openDashboard(): void;
  back(): void;
};

export const createFamilyScrum = (
  utils: Utils,
  user: UserDTO,
  family: FamilyDTO
) => {
  const viewStates = {
    dashboard: createDashboard(utils),
  };

  const viewStack = reactive<Views[]>([
    {
      name: "dashboard",
      state: viewStates.dashboard,
    },
  ]);

  const groceriesCollection = utils.firebase.collections.groceries(family.id);

  utils.firebase.onCollectionSnapshot(groceriesCollection, (groceries) => {
    familyScrum.groceries = groceries;
  });

  const familyScrum = reactive<FamilyScrum>({
    user,
    family,
    groceries: [],
    get view() {
      return viewStack[viewStack.length - 1];
    },
    openDashboard() {
      viewStack.push({
        name: "dashboard",
        state: viewStates.dashboard,
      });
    },
    back() {
      viewStack.pop();
    },
  });

  return familyScrum;
};
