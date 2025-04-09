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
 * Performs deep equality comparison between two values with special handling for Timestamp objects
 */
function isEqualData(a: any, b: any): boolean {
  // Handle null/undefined cases
  if (a === b) return true;
  if (a == null || b == null) return false;

  // Handle Timestamp objects
  if (a instanceof Timestamp && b instanceof Timestamp) {
    return a.isEqual(b);
  }

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Check if both are objects
  if (typeof a !== "object" || typeof b !== "object") return a === b;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqualData(a[i], b[i])) return false;
    }
    return true;
  }

  // If one is array but other is not
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // Handle objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isEqualData(a[key], b[key])) return false;
  }

  return true;
}

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
    const pendingIds = new Set<string>();

    return {
      createId() {
        return doc(collection).id;
      },
      async get(id: string) {
        const docRef = doc(collection, id);
        const document = await getDoc(docRef);
        const data = document.data();

        if (!data) {
          throw new Error("can not find document");
        }

        return data;
      },
      set(data: T) {
        const docRef = doc(collection, data.id);

        pendingIds.add(data.id);

        return setDoc(docRef, data);
      },
      update(
        id: string,
        partialData: UpdateData<T> | ((data: T) => UpdateData<T>)
      ) {
        const docRef = doc(collection, id);

        pendingIds.add(id);

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

        pendingIds.add(id);

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

        pendingIds.add(id);

        return deleteDoc(docRef);
      },
      async getAll() {
        const querySnapshot = await getDocs(collection);

        return querySnapshot.docs.map((doc) => doc.data());
      },
      subscribeChanges(cb: () => void) {
        let hasAppliedInitialSnapshot = false;

        return onSnapshot(collection, (snapshot) => {
          if (!hasAppliedInitialSnapshot) {
            hasAppliedInitialSnapshot = true;
            return;
          }

          const changes = snapshot.docChanges();

          let hasRemoteChanges = false;

          changes.forEach((change) => {
            if (change.doc.metadata.hasPendingWrites) {
              pendingIds.add(change.doc.id);

              return;
            }

            if (pendingIds.has(change.doc.id)) {
              pendingIds.delete(change.doc.id);
              return;
            }

            hasRemoteChanges = true;
          });

          if (hasRemoteChanges) {
            cb();
          }
        });
      },
    };
  }
}
