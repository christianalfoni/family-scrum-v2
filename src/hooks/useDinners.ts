import { DINNERS_COLLECTION } from "../useFirebase";
import { useCollection } from "./useCollection";
import { User } from "./useCurrentUser";

export type DinnerDTO = {
  id: string;
  name: string;
  description: string;
  preparationCheckList: string[];
  groceries: string[];
  instructions: string[];
  created: number;
  modified: number;
};

export type Dinners = Record<string, DinnerDTO>;

export const useDinners = (user: User) =>
  useCollection<Dinners>(DINNERS_COLLECTION, user);
