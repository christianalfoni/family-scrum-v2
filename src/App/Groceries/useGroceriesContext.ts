import { signal } from "impact-signal";
import { context } from "impact-context";
import { useGlobalContext } from "../../useGlobalContext";
import { useAppContext } from "../useAppContext";

function GroceriesContext() {
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
      const currentInput = newGroceryInput.value;
      newGroceryInput.value = "";

      addingGrocery.value = firebase
        .setDoc(groceriesCollection, {
          id: firebase.createId(groceriesCollection),
          name,
          created: firebase.createServerTimestamp(),
          modified: firebase.createServerTimestamp(),
        })
        .catch((error) => {
          newGroceryInput.value = currentInput;

          throw error;
        });

      return addingGrocery.value;
    },
    removeGrocery(id: string) {
      removingGrocery.value = firebase.deleteDoc(groceriesCollection, id);

      return removingGrocery.value;
    },
  };
}

export const useGroceriesContext = context(GroceriesContext);
