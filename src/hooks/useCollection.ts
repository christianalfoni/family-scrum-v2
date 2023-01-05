import {
  getFirestore,
  getDocs,
  collection,
  Firestore,
  onSnapshot,
  CollectionReference,
  QuerySnapshot,
} from "@firebase/firestore";

import { useSubscriptionCache } from "../useCache";
import { FAMILY_DATA_COLLECTION, useFirebase } from "../useFirebase";
import { User } from "./useCurrentUser";

export type Collection = Record<string, Record<string, unknown>>;

export const updateCollectionRecord = <T extends Collection>(
  snapshot: QuerySnapshot,
  current?: T
): T => {
  let updatedData: T = current || ({} as T);
  snapshot.docChanges().forEach((docChange) => {
    const id = docChange.doc.id;

    switch (docChange.type) {
      case "added": {
        const data = docChange.doc.data({
          serverTimestamps: "estimate",
        });
        updatedData = {
          ...updatedData,
          [id]: {
            ...data,
            id,
            created: data.created.toMillis?.() ?? data.created,
            modified: data.modified.toMillis?.() ?? data.modified,
          },
        };
        break;
      }
      case "modified": {
        const data = docChange.doc.data({
          serverTimestamps: "estimate",
        });

        updatedData = {
          ...updatedData,
          [id]: {
            ...updatedData[id],
            ...data,
            modified: data.modified.toMillis?.() ?? data.modified,
            created: data.created.toMillis?.() ?? data.created,
          },
        };
        break;
      }
      case "removed": {
        updatedData = {
          ...updatedData,
        };
        delete updatedData[id];
        break;
      }
    }
  });

  return updatedData;
};

const getCollectionRef = (
  firestore: Firestore,
  familyId: string,
  collectionName: string
) => {
  return collection(
    firestore,
    FAMILY_DATA_COLLECTION,
    familyId,
    collectionName
  );
};

export function useCollection<T extends Collection>(
  collection: string,
  user: User
) {
  const app = useFirebase();
  const firestore = getFirestore(app);

  return useSubscriptionCache<T>(collection, (setCache) =>
    onSnapshot(
      getCollectionRef(firestore, user.familyId, collection),
      (groceriesRef) =>
        setCache((current) => updateCollectionRecord(groceriesRef, current))
    )
  );
}
