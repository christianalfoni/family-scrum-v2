import { Timestamp } from "firebase/firestore";
import { DataState } from "./data";
import { FamilyScrumState } from "./familyScrum";
import { CheckListItem, FamilyPersistence, TodoDTO } from "../context/firebase";
import { reactive } from "bonsify";
import { Context } from "../context";

type CheckListItemCompleted = {
  completed: true;
  completedByUserId: string;
};

type CheckListItemNotCompleted = {
  completed: false;
};

type CheckListItemState = {
  title: string;
  state: CheckListItemCompleted | CheckListItemNotCompleted;
  toggle(): void;
  remove(): void;
};

type TodoState = {
  description: string;
  date?: Timestamp;
  time?: string;
  checkList?: CheckListItemState[];
  archive(): void;
  addCheckListItem(description: string): void;
  removeCheckListItem(index: number): void;
};

export type NewTodo = {
  description: string;
  date?: number;
  time?: string;
  checkList?: string[];
};

export type TodosState = {
  todos: TodoState[];
  addTodo(newTodo: NewTodo): void;
};

type Params = {
  context: Context;
  data: DataState;
  familyScrum: FamilyScrumState;
  familyPersistence: FamilyPersistence;
};

export const createTodos = ({
  context,
  data,
  familyScrum,
  familyPersistence,
}: Params) => {
  const state = reactive<TodosState>({
    todos: data.todos.map(createTodo),
    addTodo(newTodo) {
      familyPersistence.todos.set({
        id: familyPersistence.todos.createId(),
        description: newTodo.description,
        date: newTodo.date
          ? context.persistence.createTimestamp(newTodo.date)
          : undefined,
        time: newTodo.time,
        checkList: newTodo.checkList?.map((title) => ({
          title,
          completed: false,
        })),
        created: context.persistence.createTimestamp(),
        modified: context.persistence.createTimestamp(),
      });
    },
  });

  return state;

  function createTodo(todoData: TodoDTO): TodoState {
    const todo = reactive<TodoState>({
      get description() {
        return todoData.description;
      },
      get date() {
        return todoData.date;
      },
      get time() {
        return todoData.time;
      },
      get checkList() {
        return todoData.checkList?.map(createCheckListItem);
      },
      archive() {
        familyPersistence.todos.delete(todoData.id);
      },
      addCheckListItem(description: string) {
        familyPersistence.todos.update(todoData.id, (currentData) => {
          if (!currentData) {
            throw new Error("Can not add check list item to non-existent todo");
          }

          const currentCheckList = currentData?.checkList ?? [];

          return {
            ...currentData,
            checkList: [
              ...currentCheckList,
              { title: description, completed: false },
            ],
          };
        });
      },
      removeCheckListItem(index: number) {
        familyPersistence.todos.update(todoData.id, (currentData) => {
          if (!currentData) {
            throw new Error("Can not add check list item to non-existent todo");
          }

          const currentCheckList = currentData?.checkList ?? [];

          return {
            ...currentData,
            checkList: [
              ...currentCheckList.slice(0, index),
              ...currentCheckList.slice(index + 1),
            ],
          };
        });
      },
    });

    return todo;

    function createCheckListItem(
      checkListItemData: CheckListItem,
      index: number
    ): CheckListItemState {
      const checkListItem = reactive<CheckListItemState>({
        get title() {
          return checkListItemData.title;
        },
        get state(): CheckListItemCompleted | CheckListItemNotCompleted {
          return checkListItemData.completed
            ? {
                completed: true,
                completedByUserId: checkListItemData.completedByUserId,
              }
            : { completed: false };
        },
        toggle() {
          familyPersistence.todos.update(todoData.id, {
            checkList: [
              ...todoData.checkList!.slice(0, index),
              checkListItemData.completed
                ? { title: checkListItemData.title, completed: false }
                : {
                    title: checkListItemData.title,
                    completed: true,
                    completedByUserId: familyScrum.session.user.id,
                  },
              ...todoData.checkList!.slice(index + 1),
            ],
          });
        },
        remove() {},
      });

      return checkListItem;
    }
  }
};
