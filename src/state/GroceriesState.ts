import { mutation, query } from "mobx-lite";

import levenshtein from "fast-levenshtein";
import { FamilyPersistence } from "../environment/Persistence";
import { Environment } from "../environment";

export class GroceriesState {
  constructor(
    private env: Environment,
    private familyPersistence: FamilyPersistence
  ) {}
  groceriesQuery = query(() => this.familyPersistence.groceries.getAll());
  categorizedGroceriesQuery = query(() => {
    const groceries = this.groceriesQuery.value || [];

    return this.env.ai.categorizeGroceries(
      groceries.map((grocery) => ({
        id: grocery.id,
        name: grocery.name,
      }))
    );
  });
  addGroceryMutation = mutation(async (name: string) => {
    const persistence = this.env.persistence;
    const groceriesApi = this.familyPersistence.groceries;

    await groceriesApi.set({
      id: groceriesApi.createId(),
      name,
      created: persistence.createServerTimestamp(),
      modified: persistence.createServerTimestamp(),
    });

    await this.groceriesQuery.revalidate();
  });
  shopGroceryMutation = mutation(async (id: string) => {
    await this.familyPersistence.groceries.delete(id);
    await this.groceriesQuery.revalidate();
  });
  subscribe() {
    return this.familyPersistence.groceries.subscribeChanges(() => {
      this.groceriesQuery.revalidate();
    });
  }
  filterGroceries(filter: string) {
    const lowerCaseInput = filter.toLowerCase();
    const groceries = this.groceriesQuery.value || [];

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
