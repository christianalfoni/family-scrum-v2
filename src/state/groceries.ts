import { reactive } from "bonsify";
import levenshtein from "fast-levenshtein";
import { FamilyScrumState } from "./familyScrum";
import { Context } from "../context";
import { FamilyPersistence, GroceryDTO } from "../context/firebase";
import { DataState } from "./data";
import { Timestamp } from "firebase/firestore";

export type GroceryState = {
  name: string;
  created: Timestamp;
  shop(): void;
};

export type GroceriesState = {
  familyScrum: FamilyScrumState;
  filter: string;
  filteredGroceries: GroceryState[];
  addGrocery(name: string): void;
};

type Params = {
  familyScrum: FamilyScrumState;
  data: DataState;
  familyPersistence: FamilyPersistence;
  context: Context;
};

export const createGroceries = ({
  context,
  data,
  familyPersistence,
  familyScrum,
}: Params) => {
  const peristence = context.persistence;
  const groceriesApi = familyPersistence.groceries;
  const state = reactive<GroceriesState>({
    familyScrum,
    filter: "",
    get filteredGroceries() {
      return filterGroceries();
    },
    addGrocery,
  });

  return state;

  async function addGrocery(name: string) {
    await groceriesApi.set({
      id: groceriesApi.createId(),
      name,
      created: peristence.createServerTimestamp(),
      modified: peristence.createServerTimestamp(),
    });
  }

  function createGroceryItem(groceryData: GroceryDTO): GroceryState {
    return {
      get name() {
        return groceryData.name;
      },
      get created() {
        return groceryData.created;
      },
      shop() {
        familyPersistence.groceries.delete(groceryData.id);
      },
    };
  }

  function filterGroceries(): GroceryState[] {
    const groceries = data.groceries.map(createGroceryItem);
    const filter = state.filter;
    const lowerCaseInput = filter.toLowerCase();
    const now = Date.now();

    return filter
      ? groceries
          .filter((grocery) => {
            const lowerCaseGroceryName = grocery.name.toLowerCase();

            return (
              lowerCaseGroceryName.includes(lowerCaseInput) ||
              levenshtein.get(
                grocery.name.toLowerCase(),
                filter.toLowerCase()
              ) < 3
            );
          })
          .sort((a, b) => {
            if (a.name.startsWith(filter) && !b.name.startsWith(filter)) {
              return -1;
            }
            if (!a.name.startsWith(filter) && b.name.startsWith(filter)) {
              return 1;
            }

            return 0;
          })
      : groceries.slice().sort((a, b) => {
          if (
            a.created.toMillis() > now ||
            a.name.toLowerCase() < b.name.toLowerCase()
          ) {
            return -1;
          } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }

          return 0;
        });
  }
};
