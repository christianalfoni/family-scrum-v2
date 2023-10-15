import { mutation, query, useCleanup, useStore } from "impact-app";
import { UserDTO, useFirebase } from "./FirebaseStore";

export function CheckListItemsStore(user: UserDTO) {
  const firebase = useFirebase();
  const checkListItemsCollection = firebase.collections.checkListItems(
    user.familyId,
  );
  const checkListItemsQuery = query(() =>
    firebase.getDocs(checkListItemsCollection),
  );

  useCleanup(
    firebase.onCollectionSnapshot(checkListItemsCollection, (update) => {
      checkListItemsQuery.set(update);
    }),
  );

  return {
    query: checkListItemsQuery,
    removeCheckListItemsByTodoId: mutation(async (todoId: string) => {
      const checkListItems = await checkListItemsQuery.promise();
      const checkListItemsToDelete = checkListItems.filter(
        (checkListItem) => checkListItem.todoId === todoId,
      );

      return Promise.all(
        checkListItemsToDelete.map((checkListItem) =>
          firebase.deleteDoc(checkListItemsCollection, checkListItem.id),
        ),
      );
    }),
    setCompleted: mutation((id: string, isCompleted: boolean) =>
      firebase.updateDoc(
        checkListItemsCollection,
        id,
        isCompleted
          ? {
              completed: true,
              completedByUserId: user.id,
            }
          : {
              completed: false,
            },
      ),
    ),
    removeItem: mutation((id: string) =>
      firebase.deleteDoc(checkListItemsCollection, id),
    ),
    addItem: mutation((todoId: string, title: string) =>
      firebase.setDoc(checkListItemsCollection, {
        id: firebase.createId(checkListItemsCollection),
        completed: false,
        created: firebase.createServerTimestamp(),
        modified: firebase.createServerTimestamp(),
        title,
        todoId,
      }),
    ),
  };
}

export const useCheckListItems = () => useStore(CheckListItemsStore);
