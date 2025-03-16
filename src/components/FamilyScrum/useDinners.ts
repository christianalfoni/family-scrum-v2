import { useEnv } from "../../environments";
import { useReactive, useReactiveEffect } from "use-reactive-react";
import { DinnerDTO } from "../../environments/Browser/Persistence";
import { useRef } from "react";

export type NewDinner = {
  name: string;
  description: string;
  groceries: string[];
  preparationCheckList: string[];
  instructions: string[];
  imageSrc?: string;
};

export type Dinners = {
  dinners: DinnerDTO[];
  addDinner(newDinner: NewDinner): void;
  setImage(dinnerId: string, imageSrc: string): Promise<void>;
  getImageUrl(imageRef: string): Promise<string>;
};

export function useDinners(familyId: string) {
  const env = useEnv();
  const familyPersistence = env.persistence.getFamilyApi(familyId);
  const familyStorage = env.storage.getFamilyStorage(familyId);
  const imageUrlCache = useRef<Record<string, Promise<string>>>({});
  const dinners = useReactive<Dinners>({
    dinners: [],
    addDinner,
    setImage,
    getImageUrl,
  });

  useReactiveEffect(() =>
    familyPersistence.dinners.subscribeAll((data) => {
      dinners.dinners = data;
    })
  );

  return useReactive.readonly(dinners);

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

  async function setImage(dinnerId: string, imageSrc: string): Promise<void> {
    const imageRef = await familyStorage.uploadImage(
      "dinners",
      dinnerId,
      imageSrc
    );

    familyPersistence.dinners.update(dinnerId, (data) => ({
      ...data,
      imageRef,
      modified: env.persistence.createTimestamp(),
    }));

    imageUrlCache.current[imageRef] = familyStorage.getImageUrl(imageRef);
  }

  function getImageUrl(imageRef: string): Promise<string> {
    if (imageRef in imageUrlCache.current) {
      return imageUrlCache.current[imageRef];
    }

    const imageUrl = familyStorage.getImageUrl(imageRef);

    imageUrlCache.current[imageRef] = imageUrl;

    return imageUrl;
  }
}
