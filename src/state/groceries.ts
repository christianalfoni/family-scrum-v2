import { reactive } from "bonsify";
import { FamilyScrumData, FamilyScrumState } from "./familyScrum";
import { Context } from "../context";
import { GroceryDTO } from "../context/firebase";

export type GroceryItem = {
  name: string;
  shop(): void;
};

export type GroceriesState = {
  groceries: GroceryItem[];
};

export const createGroceries = (
  apis: Context,
  familyScrum: FamilyScrumState,
  data: FamilyScrumData
) => {
  return reactive<GroceriesState>({
    get groceries() {
      return data.groceries.map(createGroceryItem);
    },
  });

  function createGroceryItem(groceryData: GroceryDTO): GroceryItem {
    return {
      get name() {
        return groceryData.name;
      },
      shop() {},
    };
  }
};
