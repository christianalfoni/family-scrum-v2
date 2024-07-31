import { signal } from "impact-react";
import { createCamera } from "./camera";
import { DinnerDTO, Firebase, UserDTO } from "../firebase";
import { Timestamp } from "firebase/firestore";
import { sortByCreated } from "@/utils";

export type Dinners = ReturnType<typeof createDinners>;
export type DinnerEdit = Omit<DinnerDTO, "id" | "created" | "modified">;

export async function createDinners(firebase: Firebase, user: UserDTO) {
  const camera = createCamera();
  const dinnersCollection = firebase.collections.dinners(user.familyId);
  const data = signal(
    await firebase.getDocs(dinnersCollection).then(sortByCreated)
  );
  const disposeSnapshotListener = firebase.onCollectionSnapshot(
    dinnersCollection,
    (update) => {
      data(sortByCreated(update));
    }
  );
  const savingDinner = signal(undefined);

  return {
    camera,
    get savingDinner() {
      return savingDinner();
    },
    get data() {
      return data();
    },
    addDinner(newDinner: DinnerEdit) {
      const id = firebase.createId(dinnersCollection);
      const created = firebase.createServerTimestamp();
      const modified = firebase.createServerTimestamp();

      const dinner: DinnerDTO = {
        ...newDinner,
        id,
        created,
        modified,
      };
    },
    updateDinner(id: string, updatedDinner: DinnerEdit) {},
    dispose() {
      disposeSnapshotListener();
    },
  };
}
