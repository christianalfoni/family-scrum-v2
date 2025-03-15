import { reactive } from "bonsify";
import levenshtein from "fast-levenshtein";
import { useEnv } from "../../environments";
import { useReactiveEffect } from "use-reactive-react";
import { GroceryDTO } from "../../environments/Browser/Persistence";

export type Groceries = {
  groceries: GroceryDTO[];
  addGrocery(name: string): void;
  shopGrocery(id: string): void;
  filter(filter: string): GroceryDTO[];
};

export function useGroceries(familyId: string) {
  const env = useEnv();
  const familyPersistence = env.persistence.getFamilyApi(familyId);
  const groceriesApi = familyPersistence.groceries;
  const groceries = reactive<Groceries>({
    groceries: [],
    addGrocery,
    shopGrocery,
    filter,
  });

  useReactiveEffect(() =>
    familyPersistence.groceries.subscribeAll((data) => {
      groceries.groceries = data;
    })
  );

  return reactive.readonly(groceries);

  async function shopGrocery(id: string) {
    await familyPersistence.groceries.delete(id);
  }

  async function addGrocery(name: string) {
    await groceriesApi.set({
      id: groceriesApi.createId(),
      name,
      created: env.persistence.createTimestamp(),
      modified: env.persistence.createTimestamp(),
    });
  }

  function filter(filter: string): GroceryDTO[] {
    const lowerCaseInput = filter.toLowerCase();
    const now = Date.now();

    return filter
      ? groceries.groceries
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
      : groceries.groceries.slice().sort((a, b) => {
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
