import { reactive } from "mobx-lite";
import {
  CheckListItemDTO,
  FamilyPersistence,
} from "../environment/Persistence";
import { FamilyScrumState } from "./FamilyScrumState";
import { TodoState } from "./TodoState";

export type CheckListItemState = ReturnType<typeof CheckListItemState>;

type Params = {
  data: CheckListItemDTO;
  todo: TodoState;
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrumState;
  index: number;
};

export function CheckListItemState({
  data,
  familyPersistence,
  familyScrum,
  index,
  todo,
}: Params) {
  const checkListItem = reactive({
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
