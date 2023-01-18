import {
  collection,
  doc,
  getFirestore,
  setDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { GROCERIES_COLLECTION, useFirebase } from "../useFirebase";
import { useCollection } from "./useCollection";
import { User } from "./useCurrentUser";
import { getFamilyDocRef } from "./useFamily";

export type GroceryDTO = {
  id: string;
  dinnerId?: string;
  created: number;
  modified: number;
  name: string;
};

export type Groceries = Record<string, GroceryDTO>;

export const useGroceries = (user: User) =>
  useCollection<Groceries>(GROCERIES_COLLECTION, user);

export const useStoreGrocery = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);
  const groceriesCache = useGroceries(user).suspend();

  return ({
    id,
    name,
    dinnerId,
  }: Pick<GroceryDTO, "id" | "name" | "dinnerId">) => {
    const groceriesCollection = collection(
      getFamilyDocRef(firestore, user),
      GROCERIES_COLLECTION
    );
    const groceryDocRef = doc(groceriesCollection, id);
    const groceries = groceriesCache.read();
    const grocery: GroceryDTO = groceries.data[id]
      ? {
          ...groceries.data[id],
          name,
          modified: Date.now(),
          dinnerId,
        }
      : {
          id,
          name,
          created: Date.now(),
          modified: Date.now(),
          dinnerId,
        };
    const { id: _, ...data } = grocery;

    groceriesCache.write(
      {
        ...groceries.data,
        [id]: grocery,
      },
      setDoc(groceryDocRef, data)
    );
  };
};

export const useCreateGroceryId = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);
  const groceriesCollection = collection(
    getFamilyDocRef(firestore, user),
    GROCERIES_COLLECTION
  );

  return () => doc(groceriesCollection).id;
};

export const useDeleteGrocery = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);
  const groceriesCache = useGroceries(user).suspend();

  return (id: string) => {
    const groceriesCollection = collection(
      getFamilyDocRef(firestore, user),
      GROCERIES_COLLECTION
    );
    const groceryDocRef = doc(groceriesCollection, id);

    groceriesCache.write((current) => {
      const newGroceries = { ...current };

      delete newGroceries[id];

      return newGroceries;
    }, deleteDoc(groceryDocRef));
  };
};
