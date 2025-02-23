import { reactive } from "bonsify";
import { WithRequired } from "../../utils";
import { FamilyPersistence, TodoDTO } from "../../context/firebase";
import { FamilyScrumState } from "../familyScrum";

type TodoWithCheckList = WithRequired<TodoDTO, "checkList">;

export type CheckListItemState = {
  title: string;
  completed: boolean;
  toggle(): void;
  remove(): void;
};

export function createCheckListItem(
  familyScrum: FamilyScrumState,
  familyPersistence: FamilyPersistence,
  todo: TodoWithCheckList,
  index: number
): CheckListItemState {
  const item = todo.checkList[index];
  return reactive({
    get title() {
      return item.title;
    },
    get completed() {
      return item.completed;
    },
    toggle() {
      familyPersistence.todos.update(todo.id, {
        checkList: [
          ...todo.checkList.slice(0, index),
          item.completed
            ? { title: item.title, completed: false }
            : {
                title: item.title,
                completed: true,
                completedByUserId: familyScrum.session.user.id,
              },
          ...todo.checkList.slice(index + 1),
        ],
      });
    },
    remove() {
      familyPersistence.todos.update(todo.id, {
        checkList: [
          ...todo.checkList.slice(0, index),
          ...todo.checkList.slice(index + 1),
        ],
      });
    },
  });
}
