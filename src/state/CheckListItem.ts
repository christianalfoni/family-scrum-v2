import { reactive } from "bonsify";
import {
  CheckListItemDTO,
  FamilyPersistence,
} from "../environments/Browser/Persistence";
import { FamilyScrum } from "./FamilyScrum";
import { Todo } from "./Todo";

export type CheckListItem = CheckListItemDTO & {
  remove(): void;
  toggle(): void;
};

type Params = {
  data: CheckListItemDTO;
  todo: Todo;
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrum;
  index: number;
};

export function CheckListItem({
  data,
  familyPersistence,
  familyScrum,
  index,
  todo,
}: Params): CheckListItem {
  const checkListItem = reactive<CheckListItem>({
    ...data,
    remove,
    toggle,
  });

  return reactive.readonly(checkListItem);

  function remove() {
    familyPersistence.todos.update(todo.id, (data) => ({
      ...data,
      checkList: todo.checkList?.filter((_, i) => i !== index),
    }));
  }

  function toggle() {
    familyPersistence.todos.update(todo.id, (data) => ({
      ...data,
      checkList: todo.checkList?.map((checkListItem, i) => {
        if (i !== index) return checkListItem;

        const completed = !checkListItem.completed;

        return completed
          ? {
              completed: true,
              completedByUserId: familyScrum.session.user.id,
              title: checkListItem.title,
            }
          : {
              completed: false,
              title: checkListItem.title,
            };
      }),
    }));
  }
}
