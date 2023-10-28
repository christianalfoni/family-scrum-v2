import { context } from "impact-app";

import { signal } from "impact-app";
import { useGlobalContext } from "../../useGlobalContext";
import { useAppContext } from "../useAppContext";

export const useGroceriesContext = context(() => {
  const { firebase } = useGlobalContext();
  const { user } = useAppContext();

  const groceriesCollection = firebase.collections.groceries(user.familyId);

  const newGroceryInput = signal("");
  const addingGrocery = signal<Promise<void>>();
  const removingGrocery = signal<Promise<void>>();

  return {
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
});
