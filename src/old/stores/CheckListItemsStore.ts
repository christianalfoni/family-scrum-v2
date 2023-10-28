import { signal, cleanup, store } from "impact-app";
import { UserDTO, useFirebase } from "./FirebaseStore";

export function CheckListItemsStore(user: UserDTO) {
  const firebase = useFirebase();
  const checkListItemsCollection = firebase.collections.checkListItems(
    user.familyId,
  );
  const checkListItems = signal(firebase.getDocs(checkListItemsCollection));
  const removingCheckListItemsByTodoId = signal<Promise<void[]>>();
  const settingCompleted = signal<Promise<void>>();
  const removingItem = signal<Promise<void>>();
  const addingItem = signal<Promise<void>>();

  cleanup(
    firebase.onCollectionSnapshot(checkListItemsCollection, (update) => {
      checkListItems.value = Promise.resolve(update);
    }),
  );

  return {
    get checkListItems() {
      return checkListItems.value;
    },
    get removingCheckListItemsByTodoId() {
      return removingCheckListItemsByTodoId.value;
    },
    removeCheckListItemsByTodoId(todoId: string) {
      removingCheckListItemsByTodoId.value = checkListItems.value.then(
        (list) => {
          const checkListItemsToDelete = list.filter(
            (checkListItem) => checkListItem.todoId === todoId,
          );

          return Promise.all(
            checkListItemsToDelete.map((checkListItem) =>
              firebase.deleteDoc(checkListItemsCollection, checkListItem.id),
            ),
          );
        },
      );

      return removingCheckListItemsByTodoId.value;
    },
    get settingCompleted() {
      return settingCompleted.value;
    },
    setCompleted(id: string, isCompleted: boolean) {
      settingCompleted.value = firebase.updateDoc(
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
      );

      return settingCompleted.value;
    },
    get removingItem() {
      return removingItem.value;
    },
    removeItem(id: string) {
      removingItem.value = firebase.deleteDoc(checkListItemsCollection, id);

      return removingItem.value;
    },
    get addingItem() {
      return addingItem.value;
    },
    addItem(todoId: string, title: string) {
      addingItem.value = firebase.setDoc(checkListItemsCollection, {
        id: firebase.createId(checkListItemsCollection),
        completed: false,
        created: firebase.createServerTimestamp(),
        modified: firebase.createServerTimestamp(),
        title,
        todoId,
      });

      return addingItem.value;
    },
  };
}

export const useCheckListItems = () => store(CheckListItemsStore);
