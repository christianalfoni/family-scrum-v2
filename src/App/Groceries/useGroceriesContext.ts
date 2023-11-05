import { signal } from "impact-signal";
import { context } from "impact-context";
import { useGlobalContext } from "../../useGlobalContext";
import { useAppContext } from "../useAppContext";

function GroceriesContext() {
  const { firebase } = useGlobalContext();
  const { user } = useAppContext();

  const groceriesCollection = firebase.collections.groceries(user.familyId);

  const newGroceryInput = signal("");

  return {
    get newGroceryInput() {
      return newGroceryInput.value;
    },
    changeNewGroceryInput(input: string) {
      newGroceryInput.value = input;
    },
    addGrocery() {
      const name = newGroceryInput.value;
      const currentInput = newGroceryInput.value;
      newGroceryInput.value = "";

      firebase
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
    },
    removeGrocery(id: string) {
      firebase.deleteDoc(groceriesCollection, id);
    },
  };
}

export const useGroceriesContext = context(GroceriesContext);
