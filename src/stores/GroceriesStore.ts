import { mutation, query, signal, useCleanup, useStore } from "impact-app";
import { GroceryDTO, UserDTO, useFirebase } from "./FirebaseStore";
import { useUser } from "./UserStore";

export function GroceriesStore(user: UserDTO) {
  const firebase = useFirebase();

  const groceriesQuery = query(() => firebase.getGroceries(user));
  const newGroceryInput = signal("");

  useCleanup(firebase.onGroceriesChange(user, handleGroceriesChange));

  function handleGroceriesChange(groceries: GroceryDTO[]) {
    groceriesQuery.set(groceries);
  }

  return {
    get newGroceryInput() {
      return newGroceryInput.value;
    },
    changeNewGroceryInput(input: string) {
      newGroceryInput.value = input;
    },
    groceries: groceriesQuery,
    addGrocery: mutation(() => {
      const name = newGroceryInput.value;

      newGroceryInput.value = "";

      const grocery: GroceryDTO = {
        id: firebase.createGroceryId(user),
        name,
        created: Date.now(),
        modified: Date.now(),
      };

      return firebase.setGrocery(user, grocery);
    }),
    removeGrocery: mutation((id: string) => firebase.deleteGrocery(user, id)),
  };
}

export const useGroceries = () => useStore(GroceriesStore);
