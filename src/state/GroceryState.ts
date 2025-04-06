import { reactive } from "mobx-lite";
import { FamilyPersistence, GroceryDTO } from "../environment/Persistence";

export type GroceryState = ReturnType<typeof GroceryState>;

type Params = {
  data: GroceryDTO;
  familyPersistence: FamilyPersistence;
};

export function GroceryState({ data, familyPersistence }: Params) {
  const grocery = reactive({
    ...data,
    shop,
  });

  return reactive.readonly(grocery);

  function shop() {
    familyPersistence.groceries.delete(grocery.id);
  }
}
