import { FirebaseApp } from "@firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";

export type FamilyStorage = {
  getImageUrl(imageRef: string): Promise<string>;
  uploadImage(
    collection: string,
    id: string,
    imageSrc: string
  ): Promise<string>;
};

export type Storage = {
  createFamilyStorage(familyId: string): FamilyStorage;
};

export function Storage(app: FirebaseApp): Storage {
  const storage = getStorage(app);
  const imageUrlCache: Record<string, Promise<string>> = {};

  return {
    createFamilyStorage,
  };

  function createFamilyStorage(familyId: string): FamilyStorage {
    return {
      getImageUrl(imageRef: string) {
        if (imageRef in imageUrlCache) {
          return imageUrlCache[imageRef];
        }

        const storageRef = ref(storage, imageRef + ".png");

        return (imageUrlCache[imageRef] = getDownloadURL(storageRef));
      },
      async uploadImage(collection: string, id: string, imageSrc: string) {
        const imageRef = `${familyId}/${collection}/${id}`;
        const storageRef = ref(storage, imageRef + ".png");

        delete imageUrlCache[imageRef];

        await uploadString(storageRef, imageSrc, "data_url");

        return imageRef;
      },
    };
  }
}
