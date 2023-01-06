import {
  getFirestore,
  getDoc,
  doc,
  Firestore,
  onSnapshot,
  DocumentReference,
} from "@firebase/firestore";
import { useEffect } from "react";
import { useCache, useSubscriptionCache, useSuspenseCache } from "../useCache";
import { FAMILY_DATA_COLLECTION, useFirebase } from "../useFirebase";
import { User } from "./useCurrentUser";

export type FamilyDTO = {
  id: string;
  users: {
    [id: string]: {
      name: string;
      avatar: string;
    };
  };
};

const getFamilyDocRef = (firestore: Firestore, familyId: string) => {
  return doc(firestore, FAMILY_DATA_COLLECTION, familyId);
};

export const useFamily = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);

  return useSubscriptionCache("family", (setCache) =>
    onSnapshot(getFamilyDocRef(firestore, user.familyId), (familyDoc) => {
      setCache({
        ...familyDoc.data(),
        id: familyDoc.id,
      } as FamilyDTO);
    })
  );
};
