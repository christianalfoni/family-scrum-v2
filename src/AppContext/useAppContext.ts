import { Signal, derived, signal, cleanup, context } from "impact-app";
import { useGlobalContext } from "../useGlobalContext";
import { FamilyDTO, UserDTO, WeekDTO } from "../useGlobalContext/firebase";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { Timestamp } from "firebase/firestore";

export const useAppContext = context(AppContext);

export type Props = {
  user: UserDTO;
  family: FamilyDTO;
};

/**
 * This is the main application context which fetches all the data needed. We could have initialized this
 * context with the resolved data, but we want the application to show as fast as possible and not all
 * data is needed for the initial dashboard, we just want to start fetching it as fast as possible
 */
function AppContext(props: Props) {
  const { user, family } = props;

  const { firebase } = useGlobalContext();

  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();

  const dinnersCollection = firebase.collections.dinners(user.familyId);
  const groceriesCollection = firebase.collections.groceries(user.familyId);
  const todosCollection = firebase.collections.todos(user.familyId);
  const weeksCollection = firebase.collections.weeks(user.familyId);

  // We map over the previous, current and next week to get and subscribe to
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

  // Firebase fetches urls to images asynchronously, we cache them
  const imageUrls: Record<string, Signal<Promise<string | null>>> = {};
  const dinners = signal(
    firebase.getDocs(dinnersCollection).then(sortByCreated),
  );
  const todos = signal(firebase.getDocs(todosCollection));
  const todosWithCheckList = derived(() =>
    todos.value.status === "fulfilled"
      ? todos.value.value.filter((todo) => Boolean(todo.checkList))
      : [],
  );
  const groceries = signal(firebase.getDocs(groceriesCollection));

  cleanup(previousWeek.dispose);
  cleanup(currentWeek.dispose);
  cleanup(nextWeek.dispose);

  cleanup(
    firebase.onCollectionSnapshot(todosCollection, (update) => {
      todos.value = Promise.resolve(update);
    }),
  );

  cleanup(
    firebase.onCollectionSnapshot(dinnersCollection, (update) => {
      dinners.value = Promise.resolve(sortByCreated(update));
    }),
  );

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
    get todosWithCheckList() {
      return todosWithCheckList.value;
    },
    fetchDinners() {
      return dinners.value;
    },
    fetchGroceries() {
      return groceries.value;
    },
    fetchTodos() {
      return todos.value;
    },
    weeks: {
      previous: {
        id: previousWeekId,
        fetchWeek() {
          return previousWeek.week.value;
        },
        fetchWeekTodos() {
          return previousWeek.weekTodos.value;
        },
      },
      current: {
        id: currentWeekId,
        fetchWeek() {
          return currentWeek.week.value;
        },
        fetchWeekTodos() {
          return currentWeek.weekTodos.value;
        },
      },
      next: {
        id: nextWeekId,
        fetchWeek() {
          return nextWeek.week.value;
        },
        fetchWeekTodos() {
          return nextWeek.weekTodos.value;
        },
      },
    },
    fetchImageUrl(collection: string, id: string) {
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

function collectionToLookupRecord<T extends { id: string }>(collection: T[]) {
  return collection.reduce<Record<string, T>>((aggr, doc) => {
    aggr[doc.id] = doc;

    return aggr;
  }, {});
}

function sortByCreated<T extends { created: Timestamp }>(items: T[]) {
  return items.sort((a, b) => {
    if (a.created < b.created) {
      return 1;
    } else if (a.created > b.created) {
      return -1;
    }

    return 0;
  });
}
