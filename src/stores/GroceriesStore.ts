import { mutation, query, signal, useCleanup, useStore } from "impact-app";
import { UserDTO, useFirebase } from "./FirebaseStore";

export function GroceriesStore(user: UserDTO) {
  const firebase = useFirebase();
  const groceriesCollection = firebase.collections.groceries(user.familyId);
  const groceriesQuery = query(() => firebase.getDocs(groceriesCollection));
  const newGroceryInput = signal("");

  useCleanup(
    firebase.onCollectionSnapshot(groceriesCollection, (update) =>
      groceriesQuery.set(update),
    ),
  );

  return {
    query: groceriesQuery,
    get newGroceryInput() {
      return newGroceryInput.value;
    },
    changeNewGroceryInput(input: string) {
      newGroceryInput.value = input;
    },
    addGrocery: mutation(() => {
      const name = newGroceryInput.value;

      newGroceryInput.value = "";

      return firebase.setDoc(groceriesCollection, {
        id: firebase.createId(groceriesCollection),
        name,
        created: firebase.createServerTimestamp(),
        modified: firebase.createServerTimestamp(),
      });
    }),
    removeGrocery: mutation((id: string) =>
      firebase.deleteDoc(groceriesCollection, id),
    ),
  };
}

export const useGroceries = () => useStore(GroceriesStore);
