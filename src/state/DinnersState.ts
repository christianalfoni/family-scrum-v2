import { mutation, Query, query } from "mobx-lite";
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

export class DinnersState {
  constructor(
    private env: Environment,
    private familyPersistence: FamilyPersistence,
    private familyStorage: FamilyStorage
  ) {}
  private dinnerImageQueries: Record<string, Query<string>> = {};
  private dinnerQueries: Record<string, Query<DinnerDTO>> = {};
  dinnersQuery = query(() => this.familyPersistence.dinners.getAll());
  addDinnerMutation = mutation((newDinner: NewDinner) =>
    this.addDinner(newDinner)
  );
  updateDinnerMutation = mutation(async (id: string, update: NewDinner) => {
    await this.familyPersistence.dinners.update(id, update);
    await this.dinnersQuery.revalidate();
  });
  setDinnerImageMutation = mutation(
    async ({
      id,
      imageSrc,
    }: {
      id: string;
      imageSrc: string;
    }): Promise<void> => {
      await this.familyStorage.uploadImage("dinners", id, imageSrc);
    }
  );
  queryDinner(id: string) {
    if (!this.dinnerQueries[id]) {
      this.dinnerQueries[id] = query(() =>
        this.familyPersistence.dinners.get(id)
      );
    }

    return this.dinnerQueries[id];
  }
  queryDinnerImage(imageRef: string) {
    if (!this.dinnerImageQueries[imageRef]) {
      this.dinnerImageQueries[imageRef] = query(() =>
        this.familyStorage.getImageUrl(imageRef)
      );
    }

    return this.dinnerImageQueries[imageRef];
  }
  private async addDinner(newDinner: NewDinner) {
    const id = this.familyPersistence.dinners.createId();

    let imageRef: string | undefined;

    if (newDinner.imageSrc) {
      imageRef = await this.familyStorage.uploadImage(
        "dinners",
        id,
        newDinner.imageSrc
      );
    }

    await this.familyPersistence.dinners.set({
      id,
      name: newDinner.name,
      description: newDinner.description,
      imageRef,
      groceries: newDinner.groceries,
      preparationCheckList: newDinner.preparationCheckList,
      instructions: newDinner.instructions,
      created: this.env.persistence.createServerTimestamp(),
      modified: this.env.persistence.createServerTimestamp(),
    });

    await this.dinnersQuery.revalidate();
  }
}
