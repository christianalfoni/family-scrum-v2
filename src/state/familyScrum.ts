import { reactive, readonly } from "bonsify";
import { Environment } from "../environments";
import { SessionAuthenticated } from "./Session";
import { Groceries } from "./Groceries";
import { Dinners } from "./Dinners";
import { Todos } from "./Todos";
import { Weeks } from "./Weeks";

export type FamilyScrum = {
  session: SessionAuthenticated;
  groceries: Groceries;
  todos: Todos;
  dinners: Dinners;
  weeks: Weeks;
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
    get weeks() {
      return weeks;
    },
  });

  const groceries = Groceries({
    env,
    onDispose,
    familyPersistence,
    familyScrum,
  });

  const todos = Todos({
    env,
    familyScrum,
    familyPersistence,
    onDispose,
  });

  const dinners = Dinners({
    env,
    familyScrum,
    familyPersistence,
    onDispose,
  });

  const weeks = Weeks({
    familyScrum,
    familyPersistence,
    onDispose,
  });

  return readonly(familyScrum);
}
