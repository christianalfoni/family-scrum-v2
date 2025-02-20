import { reactive } from "bonsify";
import { WithRequired } from "../utils";
import { FamilyPersistence, TodoDTO } from "../context/firebase";
import { DataState } from "./data";
import { FamilyScrumState } from "./familyScrum";

type TodoWithCheckList = WithRequired<TodoDTO, "checkList">;

type CheckListItemState = {
  title: string;
  completed: boolean;
  toggle(): void;
  remove(): void;
};

type HIDE_CHECKLIST = {
  current: "HIDE_CHECKLIST";
};

type SHOW_CHECKLIST = {
  current: "SHOW_CHECKLIST";
  add(description: string): void;
};

type TodoState = {
  state: HIDE_CHECKLIST | SHOW_CHECKLIST;
  items: CheckListItemState[];
  completedCount: number;
  archive(): void;
  toggleCheckList(): void;
};

type CheckListsState = {
  familyScrum: FamilyScrumState;
  checkLists: TodoState[];
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
    const todoState = reactive<TodoState>({
      state: HIDE_CHECKLIST(),
      items: todo.checkList.map((_, index) => createCheckListItem(todo, index)),
      get completedCount() {
        return todo.checkList.filter((item) => item.completed).length;
      },
      toggleCheckList() {
        if (todoState.state.current === "HIDE_CHECKLIST") {
          todoState.state = SHOW_CHECKLIST();
        } else {
          todoState.state = HIDE_CHECKLIST();
        }
      },
      archive() {
        familyPersistence.todos.delete(todo.id);
      },
    });

    return todoState;

    function HIDE_CHECKLIST(): HIDE_CHECKLIST {
      return {
        current: "HIDE_CHECKLIST",
      };
    }

    function SHOW_CHECKLIST(): SHOW_CHECKLIST {
      return {
        current: "SHOW_CHECKLIST",
        add(description: string) {
          familyPersistence.todos.update(todo.id, {
            checkList: [
              ...todo.checkList,
              { title: description, completed: false },
            ],
          });
        },
      };
    }
  }

  function createCheckListItem(
    todo: TodoWithCheckList,
    index: number
  ): CheckListItemState {
    const item = todo.checkList[index];
    return {
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
    };
  }
};
