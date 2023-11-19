import { derived, effect, signal, context } from "impact-app";
import { useGlobalContext } from "../../useGlobalContext";
import { useAppContext } from "../useAppContext";
import { GroceryDTO } from "../../useGlobalContext/firebase";
import levenshtein from "fast-levenshtein";
import confetti from "canvas-confetti";
import { produce } from "immer";
import { Timestamp } from "firebase/firestore";

export type Props = {
  groceries: GroceryDTO[];
};

export const useGroceriesContext = context((props: Props) => {
  const { groceries: initialGroceries } = props;

  const { firebase } = useGlobalContext();
  const { user } = useAppContext();

  const now = Date.now();
  const initialGroceriesLength = initialGroceries.length;
  const groceriesCollection = firebase.collections.groceries(user.familyId);

  const newGroceryInput = signal("");
  const groceries = signal(initialGroceries);
  const sortedAndFilteredGroceries = derived(() => {
    const input = newGroceryInput.value;
    const lowerCaseInput = input.toLowerCase();

    return newGroceryInput.value
      ? groceries.value
          .filter((grocery) => {
            const lowerCaseGroceryName = grocery.name.toLowerCase();

            return (
              lowerCaseGroceryName.includes(lowerCaseInput) ||
              levenshtein.get(grocery.name.toLowerCase(), input.toLowerCase()) <
                3
            );
          })
          .sort((a, b) => {
            if (a.name.startsWith(input) && !b.name.startsWith(input)) {
              return -1;
            }
            if (!a.name.startsWith(input) && b.name.startsWith(input)) {
              return 1;
            }

            return 0;
          })
      : groceries.value.slice().sort((a, b) => {
          if (
            a.created.toMillis() > now ||
            a.name.toLowerCase() < b.name.toLowerCase()
          ) {
            return -1;
          } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }

          return 0;
        });
  });

  effect(() => {
    if (!groceries.value.length && initialGroceriesLength) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  });

  return {
    get newGroceryInput() {
      return newGroceryInput.value;
    },
    get groceries() {
      return sortedAndFilteredGroceries.value;
    },
    changeNewGroceryInput(input: string) {
      newGroceryInput.value = input;
    },
    addGrocery() {
      const name = newGroceryInput.value;
      const currentInput = newGroceryInput.value;
      newGroceryInput.value = "";

      const grocery: GroceryDTO = {
        id: firebase.createId(groceriesCollection),
        name,
        created: Timestamp.fromDate(new Date()),
        modified: Timestamp.fromDate(new Date()),
      };

      groceries.value = produce(groceries.value, (draft) => {
        draft.push(grocery);
      });

      firebase
        .setDoc(groceriesCollection, {
          ...grocery,
          created: firebase.createServerTimestamp(),
          modified: firebase.createServerTimestamp(),
        })
        .catch((error) => {
          newGroceryInput.value = currentInput;

          throw error;
        });
    },
    removeGrocery(id: string) {
      groceries.value = groceries.value.filter((grocery) => grocery.id !== id);

      firebase.deleteDoc(groceriesCollection, id);
    },
  };
});
