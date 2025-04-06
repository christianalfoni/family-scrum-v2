import { reactive } from "mobx-lite";
import levenshtein from "fast-levenshtein";
import { FamilyScrumState } from "./FamilyScrumState";
import { FamilyPersistence, GroceryDTO } from "../environment/Persistence";
import { Environment } from "../environment";
import { GroceryState } from "./GroceryState";

export type GroceriesState = ReturnType<typeof GroceriesState>;

type Params = {
  familyScrum: FamilyScrumState;
  familyPersistence: FamilyPersistence;
  env: Environment;
  onDispose: (dispose: () => void) => void;
};

export function GroceriesState({
  env,
  familyPersistence,
  familyScrum,
  onDispose,
}: Params) {
  const peristence = env.persistence;
  const groceriesApi = familyPersistence.groceries;
  const groceries = reactive({
    familyScrum,
    groceries: {} as Record<string, GroceryState>,
    addGrocery,
    filter,
  });

  onDispose(familyPersistence.groceries.subscribeAll(createGroceries));

  return reactive.readonly(groceries);

  function createGroceries(groceryDTOs: GroceryDTO[]) {
    for (const groceryDTO of groceryDTOs) {
      groceries.groceries[groceryDTO.id] = GroceryState({
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

  function filter(filter: string): GroceryState[] {
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
