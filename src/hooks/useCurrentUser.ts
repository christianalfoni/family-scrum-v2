import { getAuth, onAuthStateChanged } from "firebase/auth";
import type * as auth from "firebase/auth";

import { useFirebase } from "../useFirebase";
import { getFirestore, doc, getDoc, Firestore } from "@firebase/firestore";

import { useSubscriptionCache } from "../useCache";

export type User = {
  id: string;
  familyId: string;
};

const USER_DATA_COLLECTION = "userData";

export const getUserDoc = async (
  firestore: Firestore,
  user: auth.User
): Promise<User> => {
  const userDocRef = doc(firestore, USER_DATA_COLLECTION, user.uid);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.data() as {
    familyId: string;
  };

  return {
    id: user.uid,
    familyId: userData.familyId,
  };
};

export const useCurrentUser = () => {
  const app = useFirebase();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return useSubscriptionCache<User | null>("user", (setCache) =>
    onAuthStateChanged(auth, async (user) => {
      console.log("WTF?", user);
      user ? setCache(await getUserDoc(firestore, user)) : setCache(null);
    })
  );
};
