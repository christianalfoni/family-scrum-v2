import { doc, getFirestore } from "firebase/firestore";
import { useMemo } from "react";

import { CHECKLIST_ITEMS_COLLECTION, useFirebase } from "../useFirebase";
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

export const useCreateCheckListItemId = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);

  return () =>
    doc(getFamilyDocRef(firestore, user), CHECKLIST_ITEMS_COLLECTION).id;
};

export const useCheckListItems = (user: User) =>
  useCollection<CheckListItems>(CHECKLIST_ITEMS_COLLECTION, user);

export const useCheckListItemsByTodoId = (checkListItems: CheckListItems) =>
  useMemo(() => createCheckListItemsByTodoId(checkListItems), [checkListItems]);
