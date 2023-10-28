import { cleanup, store, signal, derived } from "impact-app";
import {
  useFirebase,
  TodoDTO,
  CheckListItemDTO,
  UserDTO,
} from "./FirebaseStore";
import { Timestamp } from "firebase/firestore";
import { useCheckListItems } from "./CheckListItemsStore";

export type CheckListItemsByTodoId = {
  [todoId: string]: {
    [itemId: string]: CheckListItemDTO;
  };
};

export function TodosStore(user: UserDTO) {
  const firebase = useFirebase();
  const { checkListItems, removeCheckListItemsByTodoId } = useCheckListItems();
  const todosCollection = firebase.collections.todos(user.familyId);
  const checkListItemsCollection = firebase.collections.checkListItems(
    user.familyId,
  );

  const todos = signal(firebase.getDocs(todosCollection));
  const todosWithCheckListItems = derived<CheckListItemsByTodoId>(() => {
    if (checkListItems.status !== "fulfilled") {
      return {};
    }

    return checkListItems.value.reduce<CheckListItemsByTodoId>(
      (aggr, checkListItem) => {
        if (!aggr[checkListItem.todoId]) {
          aggr[checkListItem.todoId] = {};
        }

        aggr[checkListItem.todoId][checkListItem.id] = checkListItem;

        return aggr;
      },
      {},
    );
  });
  const addingTodo = signal<Promise<void[] | undefined>>();
  const archivingTodo = signal<Promise<void>>();

  cleanup(
    firebase.onCollectionSnapshot(todosCollection, (update) => {
      todos.value = Promise.resolve(update);
    }),
  );

  return {
    get todos() {
      return todos.value;
    },
    get todosWithCheckListItems() {
      return todosWithCheckListItems.value;
    },
    get addingTodo() {
      return addingTodo.value;
    },
    addTodo(
      description: string,
      optionalData: { date: Date; time: string; checkList: string[] },
    ) {
      const todo: TodoDTO = {
        id: firebase.createId(todosCollection),
        created: firebase.createServerTimestamp(),
        modified: firebase.createServerTimestamp(),
        description,
        checkList: Boolean(optionalData.checkList),
        date: optionalData.date
          ? Timestamp.fromDate(optionalData.date)
          : undefined,
        time: optionalData.time,
      };

      addingTodo.value = firebase
        .setDoc(todosCollection, todo)
        .then((setResult) => {
          if (optionalData.checkList) {
            const checkListItems = optionalData.checkList.map(
              (title): CheckListItemDTO => ({
                id: firebase.createId(checkListItemsCollection),
                completed: false,
                created: firebase.createServerTimestamp(),
                modified: firebase.createServerTimestamp(),
                title,
                todoId: todo.id,
              }),
            );
            return Promise.all(
              checkListItems.map((checkListItem) =>
                firebase.setDoc(checkListItemsCollection, checkListItem),
              ),
            );
          }
        });

      return addingTodo.value;
    },
    get archivingTodo() {
      return archivingTodo.value;
    },
    archiveTodo(id: string) {
      archivingTodo.value = todos.value
        .then((list) => {
          const todo = list.find((todo) => todo.id === id);

          if (!todo) {
            throw new Error(
              "You are trying to archive a todo that does not exist",
            );
          }

          return removeCheckListItemsByTodoId(id);
        })
        .then(() => firebase.deleteDoc(todosCollection, id));

      return archivingTodo.value;
    },
  };
}

export const useTodos = () => store(TodosStore);
