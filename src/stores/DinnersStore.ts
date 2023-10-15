import { mutation, query, useCleanup, useStore } from "impact-app";
import { DinnerDTO, UserDTO, useFirebase } from "./FirebaseStore";

export function DinnersStore(user: UserDTO) {
  const firebase = useFirebase();
  const dinnersCollection = firebase.collections.dinners(user.familyId);
  const dinnersQuery = query(() =>
    firebase.getDocs(dinnersCollection).then(sortedDinners),
  );

  useCleanup(
    firebase.onCollectionSnapshot(dinnersCollection, (update) => {
      dinnersQuery.set(sortedDinners(update));
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
    query: dinnersQuery,
    upsertDinner: mutation(
      (
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
      ) => {
        const id = data.id || firebase.createId(dinnersCollection);

        return Promise.all([
          firebase.setDoc(dinnersCollection, {
            ...data,
            created: firebase.createServerTimestamp(),
            modified: firebase.createServerTimestamp(),
            id,
          }),
          imageSrc ? firebase.upload(createDinnerImageRef(id), imageSrc) : null,
        ]);
      },
    ),
    getImageUrl: query((dinnerId: string) => {
      return firebase.getImageUrl(createDinnerImageRef(dinnerId));
    }),
  };
}

export const useDinners = () => useStore(DinnersStore);
