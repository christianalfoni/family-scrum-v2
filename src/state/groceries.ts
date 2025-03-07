import { reactive, readonly } from "bonsify";
import levenshtein from "fast-levenshtein";
import { FamilyScrum } from "./FamilyScrum";
import { FamilyPersistence, GroceryDTO } from "../Environment/Persistence";
import { Environment } from "../Environment";
import { Grocery } from "./Grocery";

export type Groceries = {
  groceries: Grocery[];
  familyScrum: FamilyScrum;
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
    groceries: [],
    addGrocery,
    filter,
  });

  onDispose(
    familyPersistence.groceries.subscribeAll((data) => {
      groceries.groceries = data.map(createGrocery);
    })
  );

  return readonly(groceries);

  function createGrocery(data: GroceryDTO) {
    return Grocery({ data, familyPersistence });
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
