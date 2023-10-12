import { initializeApp } from "@firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  useDeviceLanguage,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  initializeFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { groceriesConverter } from "./converters";
import { GroceryDTO, UserDTO } from "./types";
import { useStore } from "impact-app";

export * from "./types";

export enum Collection {
  USER_DATA = "userData",
  FAMILY_DATA = "familyData",
  GROCERIES = "groceries",
  TODOS = "todos",
  CHECKLIST_ITEMS = "checkListItems",
  DINNERS = "dinners",
}

export function FirebaseStore() {
  const provider = new GoogleAuthProvider();
  const app = initializeApp({
    apiKey: "AIzaSyAxghfnwp44VyGkJazhRvjUwbKSSAHm0oo",
    authDomain: "family-scrum-v2.vercel.app",
    projectId: "family-scrum-v2",
    storageBucket: "family-scrum-v2.appspot.com",
    messagingSenderId: "913074889172",
    appId: "1:913074889172:web:a4b2ec5787fe31fe033641",
    measurementId: "G-HHYZ9C0PEY",
  });

  const auth = getAuth(app);

  useDeviceLanguage(auth);

  initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  });

  const firestore = getFirestore(app);

  const getUserDocRef = (userUid: string) =>
    doc(firestore, Collection.USER_DATA, userUid);
  const getFamilyDocRef = (familyId: string) =>
    doc(firestore, Collection.FAMILY_DATA, familyId);
  const getGroceriesRef = (familyId: string) =>
    collection(getFamilyDocRef(familyId), Collection.GROCERIES).withConverter(
      groceriesConverter,
    );

  return {
    // Authentication
    onAuthChanged: onAuthStateChanged.bind(null, auth),
    signIn() {
      if (process.env.NODE_ENV === "development") {
        signInWithPopup(auth, provider);
      } else {
        signInWithRedirect(auth, provider);
      }
    },

    // Snaphot updates
    onGroceriesChange(user: UserDTO, cb: (groceries: GroceryDTO[]) => void) {
      const groceriesCollectionRef = getGroceriesRef(user.familyId);

      return onSnapshot(groceriesCollectionRef, (snapshot) => {
        cb(snapshot.docs.map((doc) => doc.data()));
      });
    },

    // Documents
    async getUser(userUid: string): Promise<UserDTO> {
      const userDocRef = getUserDocRef(userUid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data() as {
        familyId: string;
      };

      return {
        id: userUid,
        familyId: userData.familyId,
      };
    },

    // Groceries
    createGroceryId(user: UserDTO) {
      const groceriesCollectionRef = getGroceriesRef(user.familyId);

      return doc(groceriesCollectionRef).id;
    },
    async getGroceries(user: UserDTO): Promise<GroceryDTO[]> {
      const groceriesCollectionRef = getGroceriesRef(user.familyId);
      const querySnapshot = await getDocs(groceriesCollectionRef);

      return querySnapshot.docs.map((doc) => doc.data());
    },
    setGrocery(user: UserDTO, grocery: GroceryDTO) {
      const groceriesCollectionRef = getGroceriesRef(user.familyId);
      const groceryDocRef = doc(groceriesCollectionRef, grocery.id);

      return setDoc(groceryDocRef, grocery);
    },
    deleteGrocery(user: UserDTO, id: string) {
      const groceriesCollectionRef = getGroceriesRef(user.familyId);
      const groceryDocRef = doc(groceriesCollectionRef, id);

      return deleteDoc(groceryDocRef);
    },
  };
}

export const useFirebase = () => useStore(FirebaseStore);