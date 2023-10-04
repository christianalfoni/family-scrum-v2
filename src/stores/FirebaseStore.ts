import { initializeApp } from "@firebase/app";
import { getAuth, useDeviceLanguage } from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  initializeFirestore,
} from "firebase/firestore";

export type UserDTO = {
  id: string;
  familyId: string;
};

const USER_DATA_COLLECTION = "userData";

export function FirebaseStore() {
  const app = initializeApp({
    apiKey: "AIzaSyAxghfnwp44VyGkJazhRvjUwbKSSAHm0oo",
    authDomain: "family-scrum-v2.vercel.app",
    projectId: "family-scrum-v2",
    storageBucket: "family-scrum-v2.appspot.com",
    messagingSenderId: "913074889172",
    appId: "1:913074889172:web:a4b2ec5787fe31fe033641",
    measurementId: "G-HHYZ9C0PEY",
  });

  initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  });

  const auth = getAuth(app);

  useDeviceLanguage(auth);

  const firestore = getFirestore(app);

  return {
    app,
    auth,
    firestore,
    async getUser(userUid: string): Promise<UserDTO> {
      const userDocRef = doc(firestore, USER_DATA_COLLECTION, userUid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data() as {
        familyId: string;
      };

      return {
        id: userUid,
        familyId: userData.familyId,
      };
    },
  };
}
