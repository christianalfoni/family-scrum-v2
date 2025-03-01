import { reactive } from "bonsify";

import { Context } from "../context";
import { SessionAuthenticated } from "./session";
import { createData } from "./data";
import { createGroceries, GroceriesState } from "./groceries";
import { createTodos, TodosState } from "./todos";

export type FamilyScrumState = {
  session: SessionAuthenticated;
  groceries: GroceriesState;
  todos: TodosState;
  dispose(): void;
};

export const createFamilyScrum = (
  context: Context,
  session: SessionAuthenticated
) => {
  const familyPersistence = context.persistence.createFamilyApi(
    session.family.id
  );
  const data = createData(familyPersistence);
  const familyScrum = reactive<FamilyScrumState>({
    session,
    get groceries() {
      return groceries;
    },
    get todos() {
      return todos;
    },
    dispose() {
      data.unsubscribe();
    },
  });

  const groceries = createGroceries({
    context,
    data,
    familyPersistence,
    familyScrum,
  });

  const todos = createTodos({
    context,
    data,
    familyScrum,
    familyPersistence,
  });

  return familyScrum;
};
