import { signal, cleanup, store } from "impact-app";
import { UserDTO, useFirebase } from "./FirebaseStore";

export function GroceriesStore(user: UserDTO) {
  const firebase = useFirebase();
  const groceriesCollection = firebase.collections.groceries(user.familyId);
  const groceries = signal(firebase.getDocs(groceriesCollection));
  const newGroceryInput = signal("");
  const addingGrocery = signal<Promise<void>>();
  const removingGrocery = signal<Promise<void>>();

  cleanup(
    firebase.onCollectionSnapshot(
      groceriesCollection,
      (update) => (groceries.value = Promise.resolve(update)),
    ),
  );

  return {
    get groceries() {
      return groceries.value;
    },
    get newGroceryInput() {
      return newGroceryInput.value;
    },
    get addingGrocery() {
      return addingGrocery.value;
    },
    get removingGrocery() {
      return removingGrocery.value;
    },
    changeNewGroceryInput(input: string) {
      newGroceryInput.value = input;
    },
    addGrocery() {
      const name = newGroceryInput.value;

      newGroceryInput.value = "";

      addingGrocery.value = firebase.setDoc(groceriesCollection, {
        id: firebase.createId(groceriesCollection),
        name,
        created: firebase.createServerTimestamp(),
        modified: firebase.createServerTimestamp(),
      });

      return addingGrocery.value;
    },
    removeGrocery(id: string) {
      removingGrocery.value = firebase.deleteDoc(groceriesCollection, id);

      return removingGrocery.value;
    },
  };
}

export const useGroceries = () => store(GroceriesStore);
