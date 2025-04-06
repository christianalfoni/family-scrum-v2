import { reactive } from "mobx-lite";
import { Environment } from "../environment";
import { AUTHENTICATED } from "./SessionState";
import { GroceriesState } from "./GroceriesState";
import { DinnersState } from "./DinnersState";
import { TodosState } from "./TodosState";
import { WeeksState } from "./WeeksState";

export type FamilyScrumState = ReturnType<typeof FamilyScrumState>;

type Params = {
  env: Environment;
  session: AUTHENTICATED;
  onDispose: (dispose: () => void) => void;
};

export function FamilyScrumState({ env, session, onDispose }: Params) {
  const familyPersistence = env.persistence.createFamilyApi(session.family.id);
  const familyStorage = env.storage.createFamilyStorage(session.family.id);

  const familyScrum = reactive({
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

  const groceries = GroceriesState({
    env,
    onDispose,
    familyPersistence,
    familyScrum,
  });

  const todos = TodosState({
    env,
    familyScrum,
    familyPersistence,
    onDispose,
  });

  const dinners = DinnersState({
    env,
    familyScrum,
    familyPersistence,
    familyStorage,
    onDispose,
  });

  const weeks = WeeksState({
    familyScrum,
    familyPersistence,
    onDispose,
  });

  return reactive.readonly(familyScrum);
}
