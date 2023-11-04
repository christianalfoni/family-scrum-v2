import { Signal, derived, signal } from "impact-signal";
import { cleanup, context } from "impact-context";
import { useGlobalContext } from "../useGlobalContext";
import { FamilyDTO, UserDTO, WeekDTO } from "../useGlobalContext/firebase";
import {
  getCurrentWeekId,
  getNextWeekId,
  getPreviousWeekId,
  mod,
} from "../utils";
import { Timestamp } from "firebase/firestore";

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
  function createWeekSignals(weekId: string) {
    // We default to an empty document
    const weekPromiseSignal = signal(
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

    const weekTodosPromiseSignal = signal(
      firebase.getDocs(weekTodosCollection).then(collectionToLookupRecord),
    );

    const disposeWeekSnapshot = firebase.onDocSnapshot(
      weeksCollection,
      weekId,
      (update) => {
        weekPromiseSignal.value = Promise.resolve(update);
      },
    );

    const disposeWeekTodosSnapshot = firebase.onCollectionSnapshot(
      weekTodosCollection,
      (update) => {
        weekTodosPromiseSignal.value = Promise.resolve(
          collectionToLookupRecord(update),
        );
      },
    );

    return {
      week: weekPromiseSignal,
      weekTodos: weekTodosPromiseSignal,
      dispose() {
        disposeWeekSnapshot();
        disposeWeekTodosSnapshot();
      },
    };
  }

  // We map over three previous, current and next week to get and subscribe to
  // the week dinners and todos of the week
  const [previousWeek, currentWeek, nextWeek] = [
    previousWeekId,
    currentWeekId,
    nextWeekId,
  ].map(createWeekSignals);

  const dinnersPromiseSignal = signal(
    firebase.getDocs(dinnersCollection).then(sortByCreated),
  );
  const imageUrlPromiseSignals: Record<
    string,
    Signal<Promise<string | null>>
  > = {};
  const todosPromiseSignal = signal(firebase.getDocs(todosCollection));
  const todosWithCheckListSignal = derived(() =>
    todosPromiseSignal.value.status === "fulfilled"
      ? todosPromiseSignal.value.value.filter((todo) => Boolean(todo.checkList))
      : [],
  );
  const groceriesPromiseSignal = signal(firebase.getDocs(groceriesCollection));

  /**
   * DATA SUBSCRIPTIONS
   */
  cleanup(previousWeek.dispose);
  cleanup(currentWeek.dispose);
  cleanup(nextWeek.dispose);

  cleanup(
    firebase.onCollectionSnapshot(todosCollection, (update) => {
      todosPromiseSignal.value = Promise.resolve(update);
    }),
  );

  cleanup(
    firebase.onCollectionSnapshot(dinnersCollection, (update) => {
      dinnersPromiseSignal.value = Promise.resolve(sortByCreated(update));
    }),
  );

  cleanup(
    firebase.onCollectionSnapshot(
      groceriesCollection,
      (update) => (groceriesPromiseSignal.value = Promise.resolve(update)),
    ),
  );

  return {
    get user() {
      return user;
    },
    get family() {
      return family;
    },
    get dinnersPromise() {
      return dinnersPromiseSignal.value;
    },
    get groceriesPromise() {
      return groceriesPromiseSignal.value;
    },
    get todosPromise() {
      return todosPromiseSignal.value;
    },
    get todosWithCheckList() {
      return todosWithCheckListSignal.value;
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
    getImageUrlPromise(collection: string, id: string) {
      const ref = collection + "/" + id;

      let imageUrl = imageUrlPromiseSignals[ref];

      if (!imageUrl) {
        imageUrl = imageUrlPromiseSignals[ref] = signal(
          firebase.getImageUrl(ref).catch(() => null),
        );
      }

      return imageUrl.value;
    },
  };
}

export const useAppContext = context(AppContext);
