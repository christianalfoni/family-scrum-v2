import { GROCERIES_COLLECTION } from "../useFirebase";
import { useCollection } from "./useCollection";
import { User } from "./useCurrentUser";

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
