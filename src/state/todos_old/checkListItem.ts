import { reactive } from "bonsify";
import { CheckListItemDTO, FamilyPersistence } from "../../context/firebase";
import { FamilyScrumState } from "../FamilyScrum";

type CheckListItemCompleted = {
  completed: true;
  completedByUserId: string;
};

type CheckListItemNotCompleted = {
  completed: false;
};

export type CheckListItemState = {
  title: string;
  state: CheckListItemCompleted | CheckListItemNotCompleted;
  toggle(): void;
  remove(): void;
};

type Params = {
  todoId: string;
  checkListData: CheckListItemDTO[];
  index: number;
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrumState;
};

export function createCheckListItem({
  todoId,
  checkListData,
  index,
  familyPersistence,
  familyScrum,
}: Params) {
  const data = checkListData[index];

  const checkListItem = reactive<CheckListItemState>({
    get title() {
      return data.title;
    },
    get state(): CheckListItemCompleted | CheckListItemNotCompleted {
      return data.completed
        ? {
            completed: true,
            completedByUserId: data.completedByUserId,
          }
        : { completed: false };
    },
    toggle() {
      familyPersistence.todos.update(todoId, {
        checkList: [
          ...checkListData.slice(0, index),
          data.completed
            ? { title: data.title, completed: false }
            : {
                title: data.title,
                completed: true,
                completedByUserId: familyScrum.session.user.id,
              },
          ...checkListData.slice(index + 1),
        ],
      });
    },
    remove() {
      familyPersistence.todos.update(todoId, {
        checkList: [
          ...checkListData.slice(0, index),
          ...checkListData.slice(index + 1),
        ],
      });
    },
  });

  return checkListItem;
}
