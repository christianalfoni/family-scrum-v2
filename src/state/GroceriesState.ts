import { reactive } from "mobx-lite";

import levenshtein from "fast-levenshtein";
import { FamilyPersistence, GroceryDTO } from "../environment/Persistence";
import { Environment } from "../environment";

export type GroceriesState = ReturnType<typeof GroceriesState>;

type Params = {
  familyPersistence: FamilyPersistence;
  env: Environment;
};

export function GroceriesState({ env, familyPersistence }: Params) {
  const peristence = env.persistence;
  const groceriesApi = familyPersistence.groceries;
  const state = reactive({
    groceriesQuery: reactive.query(groceriesApi.getAll),
    categorizedGroceriesQuery: reactive.query(categorizeGroceries),
    filterGroceries,
    addGrocery: reactive.mutation(addGrocery),
    shopGrocery: reactive.mutation(shopGrocery),
    subscribe,
  });

  return reactive.readonly(state);

  function categorizeGroceries() {
    const groceries: GroceryDTO[] = state.groceriesQuery.value || [];

    return env.ai.categorizeGroceries(
      groceries.map((grocery) => ({
        id: grocery.id,
        name: grocery.name,
      }))
    );
  }

  function subscribe() {
    return groceriesApi.subscribeChanges(() => {
      console.log("Revalidating!");
      state.groceriesQuery.revalidate();
    });
  }

  async function shopGrocery(id: string) {
    await familyPersistence.groceries.delete(id);
    await state.groceriesQuery.revalidate();
  }

  async function addGrocery(name: string) {
    await groceriesApi.set({
      id: groceriesApi.createId(),
      name,
      created: peristence.createServerTimestamp(),
      modified: peristence.createServerTimestamp(),
    });

    await state.groceriesQuery.revalidate();
  }

  function filterGroceries(filter: string) {
    const lowerCaseInput = filter.toLowerCase();
    const now = Date.now();
    const groceries = state.groceriesQuery.value || [];

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
          if (a.created.getTime() > b.created.getTime()) {
            return -1;
          }

          return 1;
        });
  }
}
