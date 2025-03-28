import levenshtein from "fast-levenshtein";
import { useEnv } from "../../environments";
import { GroceryDTO } from "../../environments/Browser/Persistence";

import { useEffect, useState } from "react";

export type Groceries = ReturnType<typeof useGroceries>;

export function useGroceries(familyId: string) {
  const env = useEnv();
  const familyPersistence = env.persistence.getFamilyApi(familyId);
  const groceriesApi = familyPersistence.groceries;
  const [groceries, setGroceries] = useState<GroceryDTO[]>([]);

  useEffect(() => familyPersistence.groceries.subscribeAll(setGroceries), []);

  return {
    groceries,
    addGrocery,
    shopGrocery,
    filter,
  };

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
}
