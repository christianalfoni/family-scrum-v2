import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useMemo } from "react";

import { CHECKLIST_ITEMS_COLLECTION, useFirebase } from "./useFirebase";
import { useCollection } from "./useCollection";
import { User } from "./useCurrentUser";
import { getFamilyDocRef } from "./useFamily";

export type CheckListItemDTO = {
  id: string;
  todoId: string;
  title: string;
  created: number;
  modified: number;
} & (
  | {
      completed: false;
    }
  | {
      completed: true;
      completedByUserId: string;
    }
);

export type CheckListItems = Record<string, CheckListItemDTO>;

export const createCheckListItemsByTodoId = (checkListItems: CheckListItems) =>
  Object.values(checkListItems).reduce<{
    [todoId: string]: {
      [itemId: string]: CheckListItemDTO;
    };
  }>((aggr, checkListItem) => {
    if (!aggr[checkListItem.todoId]) {
      aggr[checkListItem.todoId] = {};
    }

    aggr[checkListItem.todoId][checkListItem.id] = checkListItem;

    return aggr;
  }, {});

export const useCheckListItemsByTodoId = (checkListItems: CheckListItems) =>
  useMemo(() => createCheckListItemsByTodoId(checkListItems), [checkListItems]);

export const useCreateCheckListItemId = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);

  return () =>
    doc(
      collection(getFamilyDocRef(firestore, user), CHECKLIST_ITEMS_COLLECTION),
    ).id;
};

export const useCheckListItems = (user: User) =>
  useCollection<CheckListItems>(CHECKLIST_ITEMS_COLLECTION, user);

export const useToggleCheckListItem = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);
  const checkListItemsCache = useCheckListItems(user).suspend();

  return (id: string) => {
    const familyDocRef = getFamilyDocRef(firestore, user);
    const checkListItemDoc = doc(familyDocRef, CHECKLIST_ITEMS_COLLECTION, id);
    const checkListItem = checkListItemsCache.read().data[id];

    checkListItemsCache.write(
      (current) => ({
        ...current,
        [id]: checkListItem.completed
          ? {
              ...checkListItem,
              completed: false,
            }
          : {
              ...checkListItem,
              completed: true,
              completedByUserId: user.id,
            },
      }),
      updateDoc(
        checkListItemDoc,
        checkListItem.completed
          ? {
              completed: false,
              modified: serverTimestamp(),
            }
          : {
              completed: true,
              modified: serverTimestamp(),
              completedByUserId: user.id,
            },
      ),
    );
  };
};

export const useDeleteCheckListItem = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);
  const checkListItemsCache = useCheckListItems(user).suspend();

  return (id: string) => {
    const familyDocRef = getFamilyDocRef(firestore, user);
    const checkListItemDoc = doc(familyDocRef, CHECKLIST_ITEMS_COLLECTION, id);

    checkListItemsCache.write((current) => {
      const newCheckListItems = { ...current };

      delete newCheckListItems[id];

      return newCheckListItems;
    }, deleteDoc(checkListItemDoc));
  };
};

export const useAddCheckListItem = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);
  const checkListItemsCache = useCheckListItems(user).suspend();
  const createCheckListItemId = useCreateCheckListItemId(user);

  return (todoId: string, title: string) => {
    const familyDocRef = getFamilyDocRef(firestore, user);
    const id = createCheckListItemId();
    const item: CheckListItemDTO = {
      id,
      completed: false,
      created: Date.now(),
      modified: Date.now(),
      title,
      todoId,
    };

    const { id: _, ...data } = item;

    checkListItemsCache.write(
      (current) => ({
        ...current,
        [id]: item,
      }),
      setDoc(doc(familyDocRef, CHECKLIST_ITEMS_COLLECTION, id), data),
    );
  };
};
