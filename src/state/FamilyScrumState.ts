import { reactive } from "mobx-lite";
import { Environment } from "../environment";
import { GroceriesState } from "./GroceriesState";
import { DinnersState } from "./DinnersState";
import { TodosState } from "./TodosState";
import { WeeksState } from "./WeeksState";
import { FamilyDTO, UserDTO } from "../environment/Persistence";

type Params = {
  env: Environment;
  user: UserDTO;
  family: FamilyDTO;
};

export type FamilyScrumState = ReturnType<typeof FamilyScrumState>;

export function FamilyScrumState({ env, user, family }: Params) {
  const familyPersistence = env.persistence.createFamilyApi(family.id);
  const familyStorage = env.storage.createFamilyStorage(family.id);

  const state = reactive({
    user,
    family,
    camera: env.camera,
    awake: env.awake,
    groceries: GroceriesState({
      env,
      familyPersistence,
    }),
    todos: TodosState({
      env,
      familyPersistence,
      user,
    }),
    dinners: DinnersState({
      env,
      familyPersistence,
      familyStorage,
    }),
    weeks: WeeksState({
      familyPersistence,
      user,
    }),
  });

  return reactive.readonly(state);
}
