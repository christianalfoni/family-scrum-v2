import { query, useCleanup, useStore } from "impact-app";
import { FirebaseStore, GroceryDTO, UserDTO } from "./FirebaseStore";

export function GroceriesStore(user: UserDTO) {
  const firebaseStore = useStore(FirebaseStore);

  const groceriesQuery = query(() => firebaseStore.getGroceries(user));

  useCleanup(firebaseStore.onGroceriesChange(user, handleGroceriesChange));

  function handleGroceriesChange(groceries: GroceryDTO[]) {
    groceriesQuery.setValue(groceries);
  }

  return {
    groceries: groceriesQuery,
  };
}
