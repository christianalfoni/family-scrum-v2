import { Signal, signal, cleanup, store } from "impact-app";
import { DinnerDTO, UserDTO, useFirebase } from "./FirebaseStore";
import { UploadResult } from "firebase/storage";

export function DinnersStore(user: UserDTO) {
  const firebase = useFirebase();
  const dinnersCollection = firebase.collections.dinners(user.familyId);
  const dinners = signal(
    firebase.getDocs(dinnersCollection).then(sortedDinners),
  );
  const upsertingDinner = signal<Promise<[void, UploadResult | null]>>();
  const imageUrls: Record<string, Signal<Promise<string>>> = {};

  cleanup(
    firebase.onCollectionSnapshot(dinnersCollection, (update) => {
      dinners.value = Promise.resolve(sortedDinners(update));
    }),
  );

  function sortedDinners(dinners: DinnerDTO[]) {
    return dinners.slice().sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      } else if (a.created > b.created) {
        return -1;
      }

      return 0;
    });
  }

  const createDinnerImageRef = (id: string) => `dinners/${id}`;

  return {
    get dinners() {
      return dinners.value;
    },
    get upsertingDinner() {
      return upsertingDinner.value;
    },
    upsertDinner(
      data: Pick<
        DinnerDTO,
        | "description"
        | "groceries"
        | "instructions"
        | "name"
        | "preparationCheckList"
      > & {
        id?: string;
      },
      imageSrc?: string,
    ) {
      const id = data.id || firebase.createId(dinnersCollection);

      upsertingDinner.value = Promise.all([
        firebase.setDoc(dinnersCollection, {
          ...data,
          created: firebase.createServerTimestamp(),
          modified: firebase.createServerTimestamp(),
          id,
        }),
        imageSrc ? firebase.upload(createDinnerImageRef(id), imageSrc) : null,
      ]);

      return upsertingDinner.value;
    },
    getImageUrl(dinnerId: string) {
      let existingImageUrl = imageUrls[dinnerId];

      if (!existingImageUrl) {
        existingImageUrl = imageUrls[dinnerId] = signal(
          firebase.getImageUrl(createDinnerImageRef(dinnerId)),
        );
      }

      return existingImageUrl.value;
    },
  };
}

export const useDinners = () => store(DinnersStore);
