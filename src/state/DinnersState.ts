import { reactive } from "mobx-lite";
import { Environment } from "../environment";
import { DinnerDTO, FamilyPersistence } from "../environment/Persistence";
import { FamilyStorage } from "../environment/Storage";

export type NewDinner = {
  name: string;
  description: string;
  groceries: string[];
  preparationCheckList: string[];
  instructions: string[];
  imageSrc?: string;
};

type Params = {
  env: Environment;
  familyPersistence: FamilyPersistence;
  familyStorage: FamilyStorage;
};

export function DinnersState({
  env,
  familyPersistence,
  familyStorage,
}: Params) {
  const dinnerImageQueries: Record<string, reactive.Query<string>> = {};
  const dinnerQueries: Record<string, reactive.Query<DinnerDTO>> = {};

  const state = reactive({
    dinnersQuery: reactive.query(familyPersistence.dinners.getAll),
    queryDinnerImage,
    queryDinner,
    addDinnerMutation: reactive.mutation(addDinner),
    setDinnerImageMutation: reactive.mutation(setDinnerImage),
    subscribe,
  });

  return reactive.readonly(state);

  function subscribe() {
    // TODO: Pass ids to the callback so we can invalidate individual queries
    return familyPersistence.dinners.subscribeChanges(() => {
      state.dinnersQuery.revalidate();
    });
  }

  function queryDinner(id: string) {
    if (!dinnerQueries[id]) {
      dinnerQueries[id] = reactive.query(() =>
        familyPersistence.dinners.get(id)
      );
    }

    return dinnerQueries[id];
  }

  function queryDinnerImage(imageRef: string) {
    if (!dinnerImageQueries[imageRef]) {
      dinnerImageQueries[imageRef] = reactive.query(() =>
        familyStorage.getImageUrl(imageRef)
      );
    }

    return dinnerImageQueries[imageRef];
  }

  async function setDinnerImage({
    id,
    imageSrc,
  }: {
    id: string;
    imageSrc: string;
  }): Promise<void> {
    await familyStorage.uploadImage("dinners", id, imageSrc);
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

    await familyPersistence.dinners.set({
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

    await state.dinnersQuery.revalidate();
  }
}
