import { reactive } from "bonsify";
import { DataState } from "./Data";
import { FamilyScrumState } from "./FamilyScrum";
import { DinnerDTO, FamilyPersistence } from "../context/firebase";
import { Context } from "../context";

export type NewDinner = {
  name: string;
  description: string;
  groceries: string[];
  preparationCheckList: string[];
  instructions: string[];
};

export type DinnerState = Readonly<DinnerDTO>;

export type DinnersState = {
  dinners: DinnerState[];
  addDinner(newDinner: NewDinner): void;
};

type Params = {
  context: Context;
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrumState;
  data: DataState;
};

export function createDinners({ data, familyPersistence, context }: Params) {
  const dinners = reactive<DinnersState>({
    get dinners() {
      return data.dinners;
    },
    addDinner,
  });

  return dinners;

  function addDinner(newDinner: NewDinner) {
    familyPersistence.dinners.set({
      id: familyPersistence.dinners.createId(),
      name: newDinner.name,
      description: newDinner.description,
      groceries: newDinner.groceries,
      preparationCheckList: newDinner.preparationCheckList,
      instructions: newDinner.instructions,
      created: context.persistence.createTimestamp(),
      modified: context.persistence.createTimestamp(),
    });
  }
}
