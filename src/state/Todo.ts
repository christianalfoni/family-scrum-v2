import {
  CheckListItemDTO,
  FamilyPersistence,
  TodoDTO,
} from "../environments/Browser/Persistence";
import { reactive } from "bonsify";
import { FamilyScrum } from "./FamilyScrum";
import { CheckListItem } from "./CheckListItem";

export type Todo = Omit<TodoDTO, "checkList"> & {
  checkList: CheckListItem[];
  archive(): void;
  addCheckListItem(description: string): void;
};

type Params = {
  data: TodoDTO;
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrum;
};

export function Todo({ data, familyPersistence, familyScrum }: Params): Todo {
  const todo = reactive<Todo>({
    ...data,
    get checkList(): CheckListItem[] {
      return checkList;
    },
    archive,
    addCheckListItem,
  });

  const checkList = data.checkList?.map(createCheckListItem) ?? [];

  return reactive.readonly(todo);

  function createCheckListItem(data: CheckListItemDTO, index: number) {
    return CheckListItem({ data, index, familyPersistence, familyScrum, todo });
  }

  function archive() {
    familyPersistence.todos.delete(todo.id);
  }

  function addCheckListItem(description: string) {
    familyPersistence.todos.update(todo.id, (data) => ({
      ...data,
      checkList: [
        ...(data.checkList || []),
        {
          title: description,
          completed: false,
        },
      ],
    }));
  }
}
