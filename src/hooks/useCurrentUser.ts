import { getAuth, onAuthStateChanged } from "firebase/auth";
import type * as auth from "firebase/auth";

import { useFirebase } from "../useFirebase";
import { getFirestore, doc, getDoc, Firestore } from "@firebase/firestore";

import { useEffect } from "react";
import { useCache } from "../useCache";

export type User = {
  id: string;
  familyId: string;
};

const USER_DATA_COLLECTION = "userData";

export const getUserDoc = async (
  firestore: Firestore,
  user: auth.User
): Promise<User> => {
  const userDoc = doc(firestore, USER_DATA_COLLECTION, user.uid);
  const userDataDoc = await getDoc(userDoc);
  const userData = userDataDoc.data() as {
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
  const [cache, setCache] = useCache<User | null>(
    "currentUser",
    () =>
      new Promise((resolve, reject) => {
        const dispose = onAuthStateChanged(auth, async (user) => {
          dispose();
          try {
            resolve(user ? await getUserDoc(firestore, user) : null);
          } catch (error) {
            reject(error);
          }
        });
      })
  );

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        user ? setCache(getUserDoc(firestore, user)) : setCache(null);
      }),
    []
  );

  return cache.data;
};
