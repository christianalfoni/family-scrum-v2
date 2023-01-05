import { useMemo } from "react";
import { InitializingCache } from "../useCache";
import { CHECKLIST_ITEMS_COLLECTION } from "../useFirebase";
import { useCollection } from "./useCollection";
import { User } from "./useCurrentUser";

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

export const useCheckListItems = (user: User) =>
  useCollection<CheckListItems>(CHECKLIST_ITEMS_COLLECTION, user);

export const useCheckListItemsByTodoId = (checkListItems: CheckListItems) =>
  useMemo(() => createCheckListItemsByTodoId(checkListItems), [checkListItems]);
