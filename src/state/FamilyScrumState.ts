import { Environment } from "../environment";
import { GroceriesState } from "./GroceriesState";
import { DinnersState } from "./DinnersState";
import { TodosState } from "./TodosState";
import { WeeksState } from "./WeeksState";
import { FamilyDTO, UserDTO } from "../environment/Persistence";

export class FamilyScrumState {
  groceries: GroceriesState;
  todos: TodosState;
  dinners: DinnersState;
  weeks: WeeksState;
  constructor(
    private env: Environment,
    public user: UserDTO,
    public family: FamilyDTO
  ) {
    const familyPersistence = env.persistence.createFamilyApi(family.id);
    const familyStorage = env.storage.createFamilyStorage(family.id);

    this.groceries = new GroceriesState(env, familyPersistence);
    this.todos = new TodosState(
      env,
      familyPersistence,
      user,
    );
    this.dinners = new DinnersState(
      env,
      familyPersistence,
      familyStorage,
    );
    this.weeks = new WeeksState(
      familyPersistence,
      user,
    });
  }
}
