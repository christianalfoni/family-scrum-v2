import { reactive } from "bonsify";
import { WithRequired } from "../../utils";
import { FamilyPersistence, TodoDTO } from "../../context/firebase";
import { DataState } from "../data";
import { FamilyScrumState } from "../familyScrum";
import { CheckListItemState, createCheckListItem } from "./checkListItem";

type TodoWithCheckList = WithRequired<TodoDTO, "checkList">;

type CheckListState = {
  items: CheckListItemState[];
  completedCount: number;
  newItemDescription: string;
  addItem(): void;
  archive(): void;
};

type CheckListsState = {
  familyScrum: FamilyScrumState;
  checkLists: CheckListState[];
};

type Params = {
  familyScrum: FamilyScrumState;
  data: DataState;
  familyPersistence: FamilyPersistence;
};

export const createCheckLists = ({
  familyScrum,
  data,
  familyPersistence,
}: Params) => {
  const state = reactive<CheckListsState>({
    familyScrum,
    get checkLists() {
      return data.todos
        .filter((todo): todo is TodoWithCheckList => Boolean(todo.checkList))
        .map(createCheckList);
    },
  });

  return state;

  function createCheckList(todo: TodoWithCheckList) {
    const checkListState = reactive<CheckListState>({
      items: todo.checkList.map((_, index) =>
        createCheckListItem(familyScrum, familyPersistence, todo, index)
      ),
      get completedCount() {
        return todo.checkList.filter((item) => item.completed).length;
      },
      newItemDescription: "",
      addItem() {
        familyPersistence.todos.update(todo.id, {
          checkList: [
            ...todo.checkList,
            { title: checkListState.newItemDescription, completed: false },
          ],
        });
        checkListState.newItemDescription = "";
      },
      archive() {
        familyPersistence.todos.delete(todo.id);
      },
    });

    return checkListState;
  }
};
