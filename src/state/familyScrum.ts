import { reactive } from "bonsify";

import { Environment } from "../Environment";
import { SessionAuthenticated } from "./Session";
import { createData } from "./Data";
import { createGroceries, Groceries } from "./Groceries";
import { createTodos, TodosState } from "./todos_old";
import { createDinners, DinnersState } from "./Dinners";

export type FamilyScrum = {
  session: SessionAuthenticated;
  groceries: Groceries;
  todos: TodosState;
  dinners: DinnersState;
};

type Params = {
  env: Environment;
  session: SessionAuthenticated;
  onDispose: (dispose: () => void) => void;
};

export function FamilyScrum({ env, session, onDispose }: Params): FamilyScrum {
  const familyPersistence = env.persistence.createFamilyApi(session.family.id);
  const familyScrum = reactive<FamilyScrum>({
    session,
    get groceries() {
      return groceries;
    },
    get todos() {
      return todos;
    },
    get dinners() {
      return dinners;
    },
  });

  const groceries = Groceries({
    env,
    onDispose,
    familyPersistence,
    familyScrum,
  });

  const todos = createTodos({
    context: env,
    data,
    familyScrum,
    familyPersistence,
  });

  const dinners = createDinners({
    context: env,
    data,
    familyScrum,
    familyPersistence,
  });

  return familyScrum;
}
