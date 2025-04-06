import { reactive } from "mobx-lite";
import { FamilyScrumState } from "./FamilyScrumState";
import { Environment } from "../environment";
import { DinnerDTO, FamilyPersistence } from "../environment/Persistence";
import { FamilyStorage } from "../environment/Storage";
import { DinnerState } from "./DinnerState";

export type NewDinner = {
  name: string;
  description: string;
  groceries: string[];
  preparationCheckList: string[];
  instructions: string[];
  imageSrc?: string;
};

export type DinnersState = ReturnType<typeof DinnersState>;

type Params = {
  env: Environment;
  familyPersistence: FamilyPersistence;
  familyStorage: FamilyStorage;
  familyScrum: FamilyScrumState;
  onDispose: (dispose: () => void) => void;
};

export function DinnersState({
  env,
  familyPersistence,
  familyStorage,
  onDispose,
  familyScrum,
}: Params) {
  const dinners = reactive({
    familyScrum,
    dinners: [] as DinnerState[],
    addDinner,
  });

  onDispose(
    familyPersistence.dinners.subscribeAll((data) => {
      dinners.dinners = data.map(createDinner);
    })
  );

  return reactive.readonly(dinners);

  function createDinner(data: DinnerDTO): DinnerState {
    return DinnerState({ data, familyStorage });
  }

  async function addDinner(newDinner: NewDinner) {
    const id = familyPersistence.dinners.createId();

    let imageRef: string | undefined;

    if (newDinner.imageSrc) {
      imageRef = await familyStorage.uploadImage(
        "dinners",
        id,
        newDinner.imageSrc
      );
    }

    familyPersistence.dinners.set({
      id,
      name: newDinner.name,
      description: newDinner.description,
      imageRef,
      groceries: newDinner.groceries,
      preparationCheckList: newDinner.preparationCheckList,
      instructions: newDinner.instructions,
      created: env.persistence.createTimestamp(),
      modified: env.persistence.createTimestamp(),
    });
  }
}
