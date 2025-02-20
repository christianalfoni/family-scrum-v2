import { reactive } from "bonsify";
import levenshtein from "fast-levenshtein";
import { FamilyScrumState } from "./familyScrum";
import { Context } from "../context";
import { FamilyPersistence, GroceryDTO } from "../context/firebase";
import { DataState } from "./data";
import { Timestamp } from "firebase/firestore";
import { Awake } from "../context/awake";

export type GroceryItem = {
  name: string;
  created: Timestamp;
  shop(): void;
};

export type GroceriesState = {
  familyScrum: FamilyScrumState;
  input: string;
  groceries: GroceryItem[];
  awake: Awake;
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
    input: "",
    get groceries() {
      return filterGroceries();
    },
    addGrocery,
    awake: context.awake,
  });

  return state;

  async function addGrocery() {
    await groceriesApi.set({
      id: groceriesApi.createId(),
      name: state.input,
      created: peristence.createServerTimestamp(),
      modified: peristence.createServerTimestamp(),
    });

    state.input = "";
  }

  function createGroceryItem(groceryData: GroceryDTO): GroceryItem {
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

  function filterGroceries(): GroceryItem[] {
    const groceries = data.groceries.map(createGroceryItem);
    const input = state.input;
    const lowerCaseInput = input.toLowerCase();
    const now = Date.now();

    return input
      ? groceries
          .filter((grocery) => {
            const lowerCaseGroceryName = grocery.name.toLowerCase();

            return (
              lowerCaseGroceryName.includes(lowerCaseInput) ||
              levenshtein.get(grocery.name.toLowerCase(), input.toLowerCase()) <
                3
            );
          })
          .sort((a, b) => {
            if (a.name.startsWith(input) && !b.name.startsWith(input)) {
              return -1;
            }
            if (!a.name.startsWith(input) && b.name.startsWith(input)) {
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
