import { getFirestore, doc, onSnapshot, Firestore } from "@firebase/firestore";
import { useSubscriptionCache } from "../useCache";
import { FAMILY_DATA_COLLECTION, useFirebase } from "./useFirebase";
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

export const getFamilyDocRef = (firestore: Firestore, user: User) =>
  doc(firestore, FAMILY_DATA_COLLECTION, user.familyId);

export const useFamily = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);

  return useSubscriptionCache<FamilyDTO>("family", (setCache) => {
    const familyDocRef = getFamilyDocRef(firestore, user);

    return onSnapshot(familyDocRef, (familyDoc) => {
      setCache({
        ...familyDoc.data(),
        id: familyDoc.id,
      } as FamilyDTO);
    });
  });
};
