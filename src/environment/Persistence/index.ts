import { FirebaseApp } from "@firebase/app";
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

export type Persistence = ReturnType<typeof Persistence>;
export type FamilyPersistence = ReturnType<Persistence["createFamilyApi"]>;
export type WeekTodosApi = ReturnType<FamilyPersistence["createWeekTodosApi"]>;

/**
 * Creates an API specific to the collections and related functionality needed for this app,
 * The API is not aware of the current session, it is part of the global context and the app
 * needs to pass user and family id for what data to consume
 */
export function Persistence(app: FirebaseApp) {
  initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  });
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const usersCollection = collection(
    firestore,
    Collection.USER_DATA
  ).withConverter(converters.user);
  const familiesCollection = collection(
    firestore,
    Collection.FAMILY_DATA
  ).withConverter(converters.family);

  return {
    users: createCollectionApi(usersCollection),
    families: createCollectionApi(familiesCollection),
    createTimestamp(from?: number) {
      // We cast it as a Timestamp to avoid complicated typing. This value is only
      // used when sending data to Firestore and will be a Timestamp coming back from Firestore
      return from
        ? Timestamp.fromMillis(from)
        : (serverTimestamp() as Timestamp);
    },
    upload(imageRef: string, imageSrc: string) {
      const storageRef = ref(storage, imageRef + ".png");

      return uploadString(storageRef, imageSrc, "data_url");
    },
    getImageUrl(imageRef: string) {
      const storageRef = ref(storage, imageRef + ".png");

      return getDownloadURL(storageRef);
    },
    createFamilyApi(familyId: string) {
      const familyDocRef = doc(firestore, Collection.FAMILY_DATA, familyId);
      const groceriesCollection = collection(
        familyDocRef,
        Collection.GROCERIES
      ).withConverter(converters.grocery);
      const todosCollection = collection(
        familyDocRef,
        Collection.TODOS
      ).withConverter(converters.todos);
      const dinnersCollection = collection(
        familyDocRef,
        Collection.DINNERS
      ).withConverter(converters.dinner);
      const weeksCollection = collection(
        familyDocRef,
        Collection.WEEKS
      ).withConverter(converters.week);
      const getWeekTodosCollection = (weekId: string) =>
        collection(
          familyDocRef,
          Collection.WEEKS,
          weekId,
          Collection.TODOS
        ).withConverter(converters.weekTodo);

      return {
        groceries: createCollectionApi(groceriesCollection),
        dinners: createCollectionApi(dinnersCollection),
        todos: createCollectionApi(todosCollection),
        weeks: createCollectionApi(weeksCollection),
        createWeekTodosApi(weekId: string) {
          const todosCollection = getWeekTodosCollection(weekId);

          return createCollectionApi(todosCollection);
        },
      };
    },
  };

  function createCollectionApi<T extends { id: string }>(
    collection: CollectionReference<T>
  ) {
    return {
      createId() {
        return collection.id;
      },
      async get(id: string) {
        const docRef = doc(collection, id);
        const document = await getDoc(docRef);
        const data = document.data();

        return data;
      },
      set(data: T) {
        const docRef = doc(collection, data.id);

        return setDoc(docRef, data);
      },
      update(
        id: string,
        partialData: UpdateData<T> | ((data: T) => UpdateData<T>)
      ) {
        const docRef = doc(collection, id);

        if (typeof partialData === "function") {
          return runTransaction(firestore, (transaction) => {
            const docRef = doc(collection, id);

            return transaction.get(docRef).then((doc) => {
              const currentData = doc.data();

              if (!currentData) {
                throw new Error("Document does not exist");
              }

              const data = partialData(currentData);

              return transaction.update(docRef, data);
            });
          });
        }

        return updateDoc(docRef, partialData);
      },
      upsert(id: string, updatedData: (data: T | undefined) => T) {
        const docRef = doc(collection, id);

        if (typeof updatedData === "function") {
          return runTransaction(firestore, (transaction) => {
            const docRef = doc(collection, id);
            return transaction.get(docRef).then((doc) => {
              const currentData = doc.data();
              const data = updatedData(currentData);

              return transaction.set(docRef, data);
            });
          });
        }

        return updateDoc(docRef, updatedData);
      },
      delete(id: string) {
        const docRef = doc(collection, id);

        return deleteDoc(docRef);
      },
      async getAll() {
        const querySnapshot = await getDocs(collection);

        return querySnapshot.docs.map((doc) => doc.data());
      },
      subscribe(id: string, cb: (data: T) => void) {
        const docRef = doc(collection, id);
        return onSnapshot(docRef, (snapshot) => {
          const data = snapshot.data();

          if (data) {
            cb(data);
          }
        });
      },
      subscribeAll(cb: (data: T[]) => void) {
        return onSnapshot(collection, (snapshot) => {
          cb(snapshot.docs.map((doc) => doc.data()));
        });
      },
      subscribeChanges(cb: (changes: DocumentChange<T>[]) => void) {
        return onSnapshot(collection, (snapshot) => {
          cb(snapshot.docChanges());
        });
      },
    };
  }
}
