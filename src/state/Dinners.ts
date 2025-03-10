import { reactive } from "bonsify";
import { FamilyScrum } from "./FamilyScrum";
import { Environment } from "../environments";
import {
  DinnerDTO,
  FamilyPersistence,
} from "../environments/Browser/Persistence";
import { FamilyStorage } from "../environments/Browser/Storage";
import { Dinner } from "./Dinner";

export type NewDinner = {
  name: string;
  description: string;
  groceries: string[];
  preparationCheckList: string[];
  instructions: string[];
  imageSrc?: string;
};

export type Dinners = {
  familyScrum: FamilyScrum;
  dinners: Dinner[];
  addDinner(newDinner: NewDinner): void;
};

type Params = {
  env: Environment;
  familyPersistence: FamilyPersistence;
  familyStorage: FamilyStorage;
  familyScrum: FamilyScrum;
  onDispose: (dispose: () => void) => void;
};

export function Dinners({
  env,
  familyPersistence,
  familyStorage,
  onDispose,
  familyScrum,
}: Params) {
  const dinners = reactive<Dinners>({
    familyScrum,
    dinners: [],
    addDinner,
  });

  onDispose(
    familyPersistence.dinners.subscribeAll((data) => {
      dinners.dinners = data.map(createDinner);
    })
  );

  return reactive.readonly(dinners);

  function createDinner(data: DinnerDTO): Dinner {
    return Dinner({ data, familyStorage });
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
