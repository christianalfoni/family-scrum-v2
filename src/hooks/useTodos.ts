import {
  collection,
  doc,
  getFirestore,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  CHECKLIST_ITEMS_COLLECTION,
  TODOS_COLLECTION,
  useFirebase,
} from "../useFirebase";
import { CheckListItemDTO, useCheckListItems } from "./useCheckListItems";
import { useCollection } from "./useCollection";
import { User } from "./useCurrentUser";
import { getFamilyDocRef } from "./useFamily";

export type TodoDTO = {
  id: string;
  created: number;
  modified: number;
  description: string;
  date?: number;
  time?: string;
  checkList?: boolean;
  grocery?: string;
};

export type Todos = Record<string, TodoDTO>;

export const useTodos = (user: User) =>
  useCollection<Todos>(TODOS_COLLECTION, user);

export const useCreateTodoId = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);

  return () => doc(getFamilyDocRef(firestore, user), TODOS_COLLECTION).id;
};

export const useStoreTodo = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);
  const todosCache = useTodos(user).suspend();
  const checkListItemsCache = useCheckListItems(user).suspend();

  return (
    {
      id,
      description,
      date,
      time,
    }: Pick<TodoDTO, "description" | "date" | "id" | "time" | "grocery">,
    checkList?: Pick<CheckListItemDTO, "id" | "title">[]
  ) => {
    const familyDocRef = getFamilyDocRef(firestore, user);
    const todosCollection = collection(familyDocRef, TODOS_COLLECTION);
    const todos = todosCache.read();
    const todo: TodoDTO = todos.data[id]
      ? {
          ...todos.data[id],
          modified: Date.now(),
          description,
          date,
          time,
          checkList: Boolean(checkList),
        }
      : {
          id,
          created: Date.now(),
          modified: Date.now(),
          description,
          date,
          time,
          checkList: Boolean(checkList),
        };

    const { id: _, ...data } = todo;

    todosCache.write(
      (current) => ({
        ...current,
        [id]: todo,
      }),
      setDoc(doc(todosCollection, id), data)
    );

    if (checkList) {
      const checkListItemsCollection = collection(
        familyDocRef,
        CHECKLIST_ITEMS_COLLECTION
      );
      const checkListItems = checkListItemsCache.read().data;
      const changedCheckListItems = checkList.filter(
        (item) =>
          !checkListItems[item.id] || checkListItems[id].title === item.title
      );

      checkListItemsCache.write(
        (current) =>
          changedCheckListItems.reduce<{
            [itemId: string]: CheckListItemDTO;
          }>(
            (aggr, item, index) => {
              const checkListItem: CheckListItemDTO = aggr[item.id]
                ? {
                    ...aggr[item.id],
                    modified: Date.now(),
                    title: checkList[index].title,
                  }
                : {
                    id: item.id,
                    completed: false,
                    created: Date.now(),
                    modified: Date.now(),
                    title: checkList[index].title,
                    todoId: id,
                  };

              aggr[item.id] = checkListItem;

              return aggr;
            },
            {
              ...current,
            }
          ),
        Promise.all(
          changedCheckListItems.map((item) => {
            const { id, ...data } = checkListItems[item.id];

            return setDoc(doc(checkListItemsCollection, id), data);
          })
        )
      );
    }
  };
};

export const useArchiveTodo = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);
  const familyDocRef = getFamilyDocRef(firestore, user);
  const todosCollection = collection(familyDocRef, TODOS_COLLECTION);
  const checkListItemsCollection = collection(
    familyDocRef,
    CHECKLIST_ITEMS_COLLECTION
  );
  const todosCache = useTodos(user).suspend();
  const checkListItemsCache = useCheckListItems(user).suspend();

  return (id: string) => {
    const checkListItems = checkListItemsCache.read();

    const checkListItemsToDelete = Object.values(checkListItems.data).filter(
      (checkListItem) => checkListItem.todoId === id
    );

    todosCache.write(
      (current) => {
        const newTodos = {
          ...current,
        };

        delete newTodos[id];

        return newTodos;
      },
      Promise.all(
        checkListItemsToDelete.map((checkListItem) =>
          deleteDoc(doc(checkListItemsCollection, checkListItem.id))
        )
      ).then(() => deleteDoc(doc(todosCollection, id)))
    );
  };
};
