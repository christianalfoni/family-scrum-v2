import { Timestamp } from "firebase/firestore";
import { DataState } from "../Data";
import { FamilyScrumState } from "../FamilyScrum";
import { FamilyPersistence, TodoDTO } from "../../context/firebase";
import { reactive } from "bonsify";
import { Context } from "../../context";
import { CheckListItemState, createCheckListItem } from "./checkListItem";

type TodoState = {
  description: string;
  date?: Timestamp;
  time?: string;
  checkList?: CheckListItemState[];
  archive(): void;
  addCheckListItem(description: string): void;
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
        return todoData.checkList?.map((_, index, checkListData) =>
          createCheckListItem({
            familyPersistence,
            familyScrum,
            checkListData,
            index,
            todoId: todoData.id,
          })
        );
      },
      archive() {
        familyPersistence.todos.delete(todoData.id);
      },
      addCheckListItem(description: string) {
        familyPersistence.todos.update(todoData.id, (currentTodoData) => {
          if (!currentTodoData) {
            throw new Error("Can not add check list item to non-existent todo");
          }

          const currentCheckList = currentTodoData?.checkList ?? [];

          return {
            ...currentTodoData,
            checkList: [
              ...currentCheckList,
              { title: description, completed: false },
            ],
          };
        });
      },
    });

    return todo;
  }
};
