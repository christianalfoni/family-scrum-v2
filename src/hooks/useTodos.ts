import { TODOS_COLLECTION } from "../useFirebase";
import { useCollection } from "./useCollection";
import { User } from "./useCurrentUser";

export type TodoDTO = {
  id: string;
  created: number;
  modified: number;
  description: string;
  date?: number;
  time?: string;
  checkList?: boolean;
  grocery?: string;
};

export type Todos = Record<string, TodoDTO>;

export const useTodos = (user: User) =>
  useCollection<Todos>(TODOS_COLLECTION, user);
