import { reactive, readonly } from "bonsify";
import { FamilyScrum } from "./FamilyScrum";

import { Environment } from "../environments";
import {
  DinnerDTO,
  FamilyPersistence,
} from "../environments/Browser/Persistence";

export type NewDinner = {
  name: string;
  description: string;
  groceries: string[];
  preparationCheckList: string[];
  instructions: string[];
};

export type Dinner = DinnerDTO;

export type Dinners = {
  familyScrum: FamilyScrum;
  dinners: Dinner[];
  addDinner(newDinner: NewDinner): void;
};

type Params = {
  env: Environment;
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrum;
  onDispose: (dispose: () => void) => void;
};

export function Dinners({
  env,
  familyPersistence,
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
      dinners.dinners = data;
    })
  );

  return readonly(dinners);

  function addDinner(newDinner: NewDinner) {
    familyPersistence.dinners.set({
      id: familyPersistence.dinners.createId(),
      name: newDinner.name,
      description: newDinner.description,
      groceries: newDinner.groceries,
      preparationCheckList: newDinner.preparationCheckList,
      instructions: newDinner.instructions,
      created: env.persistence.createTimestamp(),
      modified: env.persistence.createTimestamp(),
    });
  }
}
