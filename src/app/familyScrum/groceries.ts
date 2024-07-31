import { signal } from "impact-react";
import { Firebase, GroceryDTO, UserDTO } from "../firebase";
import { Timestamp } from "firebase/firestore";

export type Groceries = ReturnType<typeof createGroceries>;

export async function createGroceries(firebase: Firebase, user: UserDTO) {
  const groceriesCollection = firebase.collections.groceries(user.familyId);
  const groceries = signal(await firebase.getDocs(groceriesCollection));
  const disposeSnapshotListener = firebase.onCollectionSnapshot(
    groceriesCollection,
    groceries
  );
  const addingGrocery = signal<Promise<void> | undefined>(undefined);
  const removingGrocery = signal<Promise<void> | undefined>(undefined);

  return {
    get data() {
      return groceries();
    },
    get addingGrocery() {
      return addingGrocery();
    },
    get removingGrocery() {
      return removingGrocery();
    },
    addGrocery(name: string) {
      const grocery: GroceryDTO = {
        id: firebase.createId(groceriesCollection),
        name,
        created: Timestamp.fromDate(new Date()),
        modified: Timestamp.fromDate(new Date()),
      };

      groceries((current) => {
        current.push(grocery);
      });

      addingGrocery(
        firebase.setDoc(groceriesCollection, {
          ...grocery,
          created: firebase.createServerTimestamp(),
          modified: firebase.createServerTimestamp(),
        })
      );
    },
    removeGrocery(id: string) {
      groceries((current) => current.filter((grocery) => grocery.id !== id));

      removingGrocery(firebase.deleteDoc(groceriesCollection, id));
    },
    dispose() {
      disposeSnapshotListener();
    },
  };
}
