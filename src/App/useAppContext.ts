import { Signal, cleanup, context, derived, signal } from "impact-app";
import { useGlobalContext } from "../useGlobalContext";
import { TodoDTO, UserDTO } from "../useGlobalContext/firebase";

export const useAppContext = context(({ user }: { user: UserDTO }) => {
  const { firebase } = useGlobalContext();

  /**
   * COLLECTIONS
   */
  const familiesCollection = firebase.collections.families();
  const dinnersCollection = firebase.collections.dinners(user.familyId);
  const groceriesCollection = firebase.collections.groceries(user.familyId);
  const todosCollection = firebase.collections.todos(user.familyId);

  /**
   * DATA SIGNALS
   */
  const family = signal(firebase.getDoc(familiesCollection, user.familyId));
  const dinners = signal(firebase.getDocs(dinnersCollection));
  const imageUrls: Record<string, Signal<Promise<string>>> = {};
  const todos = signal(firebase.getDocs(todosCollection));
  const todosWithCheckList = derived(() =>
    todos.value.status === "fulfilled"
      ? todos.value.value.filter((todo) => Boolean(todo.checkList))
      : [],
  );

  /**
   * DATA SUBSCRIPTIONS
   */
  cleanup(
    firebase.onCollectionSnapshot(todosCollection, (update) => {
      todos.value = Promise.resolve(update);
    }),
  );

  cleanup(
    firebase.onCollectionSnapshot(dinnersCollection, (update) => {
      dinners.value = Promise.resolve(update);
    }),
  );

  const groceries = signal(firebase.getDocs(groceriesCollection));
  cleanup(
    firebase.onCollectionSnapshot(
      groceriesCollection,
      (update) => (groceries.value = Promise.resolve(update)),
    ),
  );

  return {
    get user() {
      return user;
    },
    get family() {
      return family.value;
    },
    get dinners() {
      return dinners.value;
    },
    get groceries() {
      return groceries.value;
    },
    get todos() {
      return todos.value;
    },
    get todosWithCheckList() {
      return todosWithCheckList.value;
    },
    getImageUrl(collection: string, id: string) {
      const ref = collection + "/" + id;

      let imageUrl = imageUrls[ref];

      if (!imageUrl) {
        imageUrl = imageUrls[ref] = signal(firebase.getImageUrl(imageUrl));
      }

      return imageUrl.value;
    },
  };
});
