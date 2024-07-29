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
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  initializeFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  CollectionReference,
  updateDoc,
  UpdateData,
  runTransaction,
  DocumentChange,
} from "firebase/firestore";
import * as converters from "./converters";

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";

export * from "./types";

export enum Collection {
  USER_DATA = "userData",
  FAMILY_DATA = "familyData",
  GROCERIES = "groceries",
  TODOS = "todos",
  DINNERS = "dinners",
  WEEKS = "weeks",
}

export type Firebase = ReturnType<typeof createFirebase>;

/**
 * Creates an API specific to the collections and related functionality needed for this app,
 * The API is not aware of the current session, it is part of the global context and the app
 * needs to pass user and family id for what data to consume
 */
export function createFirebase() {
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
  const storage = getStorage(app);

  const getFamilyDocRef = (familyId: string) =>
    doc(firestore, Collection.FAMILY_DATA, familyId);

  return {
    createServerTimestamp() {
      // We cast it as a Timestamp to avoid complicated typing. This value is only
      // used when sending data to Firestore and will be a Timestamp coming back from Firestore
      return serverTimestamp() as Timestamp;
    },
    onAuthChanged: onAuthStateChanged.bind(null, auth),
    signIn() {
      if (process.env.NODE_ENV === "development") {
        signInWithPopup(auth, provider);
      } else {
        signInWithRedirect(auth, provider);
      }
    },
    collections: {
      users() {
        return collection(firestore, Collection.USER_DATA).withConverter(
          converters.user
        );
      },
      groceries(familyId: string) {
        return collection(
          getFamilyDocRef(familyId),
          Collection.GROCERIES
        ).withConverter(converters.grocery);
      },
      todos(familyId: string) {
        return collection(
          getFamilyDocRef(familyId),
          Collection.TODOS
        ).withConverter(converters.todos);
      },
      weeks(familyId: string) {
        return collection(
          getFamilyDocRef(familyId),
          Collection.WEEKS
        ).withConverter(converters.week);
      },
      weekTodos(familyId: string, weekId: string) {
        return collection(
          getFamilyDocRef(familyId),
          Collection.WEEKS,
          weekId,
          Collection.TODOS
        ).withConverter(converters.weekTodo);
      },
      dinners(familyId: string) {
        return collection(
          getFamilyDocRef(familyId),
          Collection.DINNERS
        ).withConverter(converters.dinner);
      },
      families() {
        return collection(firestore, Collection.FAMILY_DATA).withConverter(
          converters.family
        );
      },
    },
    onCollectionChanges<T>(
      collectionRef: CollectionReference<T>,
      cb: (changes: DocumentChange<T>[]) => void
    ) {
      return onSnapshot(collectionRef, (snapshot) => {
        cb(snapshot.docChanges());
      });
    },
    onCollectionSnapshot<T>(
      collectionRef: CollectionReference<T>,
      cb: (data: T[]) => void
    ) {
      return onSnapshot(collectionRef, (snapshot) => {
        cb(snapshot.docs.map((doc) => doc.data()));
      });
    },
    onDocSnapshot<T>(
      collectionRef: CollectionReference<T>,
      id: string,
      cb: (data: T) => void
    ) {
      const docRef = doc(collectionRef, id);
      return onSnapshot(docRef, (snapshot) => {
        const data = snapshot.data();

        if (data) {
          cb(data);
        }
      });
    },
    createId<T>(collection: CollectionReference<T>) {
      return doc(collection).id;
    },
    async getDoc<T>(collection: CollectionReference<T>, id: string) {
      const docRef = doc(collection, id);
      const document = await getDoc(docRef);
      const data = document.data();

      return data;
    },
    async getDocs<T>(collection: CollectionReference<T>) {
      const querySnapshot = await getDocs(collection);

      return querySnapshot.docs.map((doc) => doc.data());
    },
    setDoc<T extends { id: string }>(
      collection: CollectionReference<T>,
      data: T
    ) {
      const docRef = doc(collection, data.id);

      return setDoc(docRef, data);
    },
    deleteDoc<T>(collection: CollectionReference<T>, id: string) {
      const docRef = doc(collection, id);

      return deleteDoc(docRef);
    },
    updateDoc<T>(
      collection: CollectionReference<T>,
      id: string,
      data: UpdateData<T>
    ) {
      const docRef = doc(collection, id);

      return updateDoc(docRef, data);
    },
    transactDoc<T>(
      collection: CollectionReference<T>,
      id: string,
      cb: (data?: T) => T | undefined
    ) {
      return runTransaction(firestore, (transaction) => {
        const docRef = doc(collection, id);
        return transaction.get(docRef).then((doc) => {
          const data = cb(doc.data());

          if (data) {
            return transaction.set(docRef, data);
          }
        });
      });
    },
    upload(imageRef: string, imageSrc: string) {
      const storageRef = ref(storage, imageRef + ".png");

      return uploadString(storageRef, imageSrc, "data_url");
    },
    getImageUrl(imageRef: string) {
      const storageRef = ref(storage, imageRef + ".png");

      return getDownloadURL(storageRef);
    },
  };
}
