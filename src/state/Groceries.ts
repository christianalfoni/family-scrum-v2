import { reactive } from "bonsify";
import levenshtein from "fast-levenshtein";
import { FamilyScrum } from "./FamilyScrum";
import {
  FamilyPersistence,
  GroceryDTO,
} from "../environments/Browser/Persistence";
import { Environment } from "../environments";
import { Grocery } from "./Grocery";

/**
 const state = useStore({
   count: 0
 })
   
 return {
   ...state,
   increase
 }
   
 function increase() {
    state.count++
 }
 
 */

export type Groceries = {
  familyScrum: FamilyScrum;
  groceries: Record<string, Grocery>;
  addGrocery(name: string): void;
  filter(filter: string): Grocery[];
};

type Params = {
  familyScrum: FamilyScrum;
  familyPersistence: FamilyPersistence;
  env: Environment;
  onDispose: (dispose: () => void) => void;
};

export function Groceries({
  env,
  familyPersistence,
  familyScrum,
  onDispose,
}: Params) {
  const peristence = env.persistence;
  const groceriesApi = familyPersistence.groceries;
  const groceries = reactive<Groceries>({
    familyScrum,
    groceries: {},
    addGrocery,
    filter,
  });

  onDispose(familyPersistence.groceries.subscribeAll(createGroceries));

  return reactive.readonly(groceries);

  function createGroceries(groceryDTOs: GroceryDTO[]) {
    for (const groceryDTO of groceryDTOs) {
      groceries.groceries[groceryDTO.id] = Grocery({
        data: groceryDTO,
        familyPersistence,
      });
    }
  }

  async function addGrocery(name: string) {
    await groceriesApi.set({
      id: groceriesApi.createId(),
      name,
      created: peristence.createTimestamp(),
      modified: peristence.createTimestamp(),
    });
  }

  function filter(filter: string): Grocery[] {
    const lowerCaseInput = filter.toLowerCase();
    const now = Date.now();

    return filter
      ? Object.values(groceries.groceries)
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
      : Object.values(groceries.groceries).sort((a, b) => {
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
}
