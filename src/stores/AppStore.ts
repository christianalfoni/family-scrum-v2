import { FamilyDTO, UserDTO, WeekDTO } from "./GlobalStore/firebase";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { Timestamp } from "firebase/firestore";
import { useGlobalStore } from "./GlobalStore";
import {
  Cleanup,
  createStore,
  derived,
  Signal,
  signal,
} from "@impact-react/signals";

export const useAppStore = createStore(AppStore);

export type Props = {
  user: UserDTO;
  family: FamilyDTO;
};

/**
 * This is the main application context which fetches all the data needed. We could have initialized this
 * context with the resolved data, but we want the application to show as fast as possible and not all
 * data is needed for the initial dashboard, we just want to start fetching it as fast as possible
 */
function AppStore(props: Props, cleanup: Cleanup) {
  const { user, family } = props;

  const { firebase } = useGlobalStore();

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
    const [week, setWeek] = signal(
      firebase.getDoc(weeksCollection, weekId).then(
        (doc): WeekDTO =>
          doc || {
            id: weekId,
            dinners: [null, null, null, null, null, null, null],
          }
      )
    );
    const weekTodosCollection = firebase.collections.weekTodos(
      user.familyId,
      weekId
    );

    const [weekTodos, setWeekTodos] = signal(
      firebase.getDocs(weekTodosCollection).then(collectionToLookupRecord)
    );

    const disposeWeekSnapshot = firebase.onDocSnapshot(
      weeksCollection,
      weekId,
      (update) => {
        setWeek(Promise.resolve(update));
      }
    );

    const disposeWeekTodosSnapshot = firebase.onCollectionSnapshot(
      weekTodosCollection,
      (update) => {
        setWeekTodos(Promise.resolve(collectionToLookupRecord(update)));
      }
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
  const [dinners, setDinners] = signal(
    firebase.getDocs(dinnersCollection).then(sortByCreated)
  );
  const [todos, setTodos] = signal(firebase.getDocs(todosCollection));
  const todosWithCheckList = derived(() => {
    const currentTodos = todos();

    return currentTodos.status === "fulfilled"
      ? currentTodos.value.filter((todo) => Boolean(todo.checkList))
      : [];
  });
  const [groceries, setGroceries] = signal(
    firebase.getDocs(groceriesCollection)
  );

  cleanup(previousWeek.dispose);
  cleanup(currentWeek.dispose);
  cleanup(nextWeek.dispose);

  cleanup(
    firebase.onCollectionSnapshot(todosCollection, (update) => {
      setTodos(Promise.resolve(update));
    })
  );

  cleanup(
    firebase.onCollectionSnapshot(dinnersCollection, (update) => {
      setDinners(Promise.resolve(sortByCreated(update)));
    })
  );

  cleanup(
    firebase.onCollectionSnapshot(groceriesCollection, (update) =>
      setGroceries(Promise.resolve(update))
    )
  );

  return {
    get user() {
      return user;
    },
    get family() {
      return family;
    },
    todosWithCheckList,
    dinners,
    groceries,
    todos,
    weeks: {
      previous: {
        id: previousWeekId,
        week: previousWeek.week,
        weekTodos: previousWeek.weekTodos,
      },
      current: {
        id: currentWeekId,
        week: currentWeek.week,
        weekTodos: currentWeek.weekTodos,
      },
      next: {
        id: nextWeekId,
        week: nextWeek.week,
        weekTodos: nextWeek.weekTodos,
      },
    },
    fetchImageUrl(collection: string, id: string) {
      const ref = collection + "/" + id;

      if (!imageUrls[ref]) {
        imageUrls[ref] = signal(firebase.getImageUrl(ref).catch(() => null));
      }

      const [imageUrl] = imageUrls[ref];

      return imageUrl;
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
