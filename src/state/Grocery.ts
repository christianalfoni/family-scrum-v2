import { reactive, readonly } from "bonsify";
import {
  FamilyPersistence,
  GroceryDTO,
} from "../environments/Browser/Persistence";

export type Grocery = GroceryDTO & {
  shop(): void;
};

type Params = {
  data: GroceryDTO;
  familyPersistence: FamilyPersistence;
};

export function Grocery({ data, familyPersistence }: Params): Grocery {
  const grocery = reactive<Grocery>({
    ...data,
    shop,
  });

  return readonly(grocery);

  function shop() {
    familyPersistence.groceries.delete(grocery.id);
  }
}
