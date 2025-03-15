import { reactive } from "bonsify";
import { Environment } from "../environments";
import { SessionAuthenticated } from "./Session";
import { Groceries } from "./Groceries";
import { Dinners } from "./Dinners";
import { Todos } from "./Todos";
import { Weeks } from "./Weeks";
import { Awake } from "../environments/Browser/Awake";

export type FamilyScrum = {
  session: SessionAuthenticated;
  groceries: Groceries;
  todos: Todos;
  dinners: Dinners;
  weeks: Weeks;
  awake: Awake;
};

type Params = {
  env: Environment;
  session: SessionAuthenticated;
  onDispose: (dispose: () => void) => void;
};

export function FamilyScrum({ env, session, onDispose }: Params): FamilyScrum {
  const familyPersistence = env.persistence.getFamilyApi(session.family.id);
  const familyStorage = env.storage.getFamilyStorage(session.family.id);

  const familyScrum = reactive<FamilyScrum>({
    session,
    awake: env.awake,
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
    familyStorage,
    onDispose,
  });

  const weeks = Weeks({
    familyScrum,
    familyPersistence,
    onDispose,
  });

  return reactive.readonly(familyScrum);
}
