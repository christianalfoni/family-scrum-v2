import { Signal, derived, signal } from "impact-signal";
import { cleanup, context } from "impact-context";
import { useGlobalContext } from "../useGlobalContext";
import { FamilyDTO, UserDTO, WeekDTO } from "../useGlobalContext/firebase";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";

function collectionToLookupRecord<T extends { id: string }>(collection: T[]) {
  return collection.reduce<Record<string, T>>((aggr, doc) => {
    aggr[doc.id] = doc;

    return aggr;
  }, {});
}

function AppContext({ user, family }: { user: UserDTO; family: FamilyDTO }) {
  const { firebase } = useGlobalContext();

  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();

  /**
   * COLLECTIONS
   */
  const dinnersCollection = firebase.collections.dinners(user.familyId);
  const groceriesCollection = firebase.collections.groceries(user.familyId);
  const todosCollection = firebase.collections.todos(user.familyId);
  const weeksCollection = firebase.collections.weeks(user.familyId);

  /**
   * DATA SIGNALS
   */
  const dinners = signal(firebase.getDocs(dinnersCollection));
  const imageUrls: Record<string, Signal<Promise<string | null>>> = {};
  const todos = signal(firebase.getDocs(todosCollection));
  const todosWithCheckList = derived(() =>
    todos.value.status === "fulfilled"
      ? todos.value.value.filter((todo) => Boolean(todo.checkList))
      : [],
  );

  // We map over three previous, current and next week to get and subscribe to
  // the week dinners and todos of the week
  const [previousWeek, currentWeek, nextWeek] = [
    previousWeekId,
    currentWeekId,
    nextWeekId,
  ].map((weekId) => {
    // We default to an empty document
    const week = signal(
      firebase.getDoc(weeksCollection, weekId).then(
        (doc): WeekDTO =>
          doc || {
            id: weekId,
            dinners: [null, null, null, null, null, null, null],
          },
      ),
    );
    const weekTodosCollection = firebase.collections.weekTodos(
      user.familyId,
      weekId,
    );

    const weekTodos = signal(
      firebase.getDocs(weekTodosCollection).then(collectionToLookupRecord),
    );

    const disposeWeekSnapshot = firebase.onDocSnapshot(
      weeksCollection,
      weekId,
      (update) => {
        week.value = Promise.resolve(update);
      },
    );

    const disposeWeekTodosSnapshot = firebase.onCollectionSnapshot(
      weekTodosCollection,
      (update) => {
        weekTodos.value = Promise.resolve(collectionToLookupRecord(update));
      },
    );

    return {
      week,
      weekTodos,
      dispose() {
        disposeWeekSnapshot();
        disposeWeekTodosSnapshot();
      },
    };
  });

  cleanup(previousWeek.dispose);
  cleanup(currentWeek.dispose);
  cleanup(nextWeek.dispose);

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
      return family;
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
    weeks: {
      get previous() {
        return {
          id: previousWeekId,
          week: previousWeek.week.value,
          weekTodos: previousWeek.weekTodos.value,
        };
      },
      get current() {
        return {
          id: currentWeekId,
          week: currentWeek.week.value,
          weekTodos: currentWeek.weekTodos.value,
        };
      },
      get next() {
        return {
          id: nextWeekId,
          week: nextWeek.week.value,
          weekTodos: nextWeek.weekTodos.value,
        };
      },
    },
    getImageUrl(collection: string, id: string) {
      const ref = collection + "/" + id;

      let imageUrl = imageUrls[ref];

      if (!imageUrl) {
        imageUrl = imageUrls[ref] = signal(
          firebase.getImageUrl(ref).catch(() => null),
        );
      }

      return imageUrl.value;
    },
  };
}

export const useAppContext = context(AppContext);
