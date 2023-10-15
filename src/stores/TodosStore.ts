import { mutation, query, useCleanup, useStore } from "impact-app";
import {
  useFirebase,
  TodoDTO,
  CheckListItemDTO,
  UserDTO,
} from "./FirebaseStore";
import { Timestamp } from "firebase/firestore";
import { useCheckListItems } from "./CheckListItemsStore";

export function TodosStore(user: UserDTO) {
  const firebase = useFirebase();
  const checkListItems = useCheckListItems();

  const todosCollection = firebase.collections.todos(user.familyId);
  const checkListItemsCollection = firebase.collections.checkListItems(
    user.familyId,
  );

  const todosQuery = query(() => firebase.getDocs(todosCollection));

  useCleanup(
    firebase.onCollectionSnapshot(todosCollection, (update) => {
      todosQuery.set(update);
    }),
  );

  return {
    query: todosQuery,
    addTodo: mutation(
      async (
        description: string,
        optionalData: { date: Date; time: string; checkList: string[] },
      ) => {
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

        const setResult = await firebase.setDoc(todosCollection, todo);

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
          await Promise.all(
            checkListItems.map((checkListItem) =>
              firebase.setDoc(checkListItemsCollection, checkListItem),
            ),
          );
        }

        return setResult;
      },
    ),
    archiveTodo: mutation(async (id: string) => {
      const todos = await todosQuery.promise();
      const todo = todos.find((todo) => todo.id === id);

      if (!todo) {
        throw new Error("You are trying to archive a todo that does not exist");
      }

      await checkListItems.removeCheckListItemsByTodoId.mutate(id);

      return firebase.deleteDoc(todosCollection, id);
    }),
  };
}

export const useTodos = () => useStore(TodosStore);
