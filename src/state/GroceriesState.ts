import { reactive } from "mobx-lite";
import levenshtein from "fast-levenshtein";
import { FamilyScrumState } from "./FamilyScrumState";
import { FamilyPersistence } from "../environment/Persistence";
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
    groceries: reactive.query(groceriesApi.getAll),
    filterGroceries,
    addGrocery: reactive.mutation(addGrocery),
    shopGrocery: reactive.mutation(shopGrocery),
    subscribe,
  });

  return reactive.readonly(state);

  function subscribe() {
    return groceriesApi.subscribeChanges(() => {
      console.log("Revalidating!");
      state.groceries.revalidate();
    });
  }

  async function shopGrocery(id: string) {
    await familyPersistence.groceries.delete(id);
    await state.groceries.revalidate();
  }

  async function addGrocery(name: string) {
    await groceriesApi.set({
      id: groceriesApi.createId(),
      name,
      created: peristence.createTimestamp(),
      modified: peristence.createTimestamp(),
    });

    await state.groceries.revalidate();
  }

  function filterGroceries(filter: string) {
    const lowerCaseInput = filter.toLowerCase();
    const now = Date.now();
    const groceries = state.groceries.value || [];

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
            return 1;
          } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return -1;
          }

          return 0;
        });
  }
}
