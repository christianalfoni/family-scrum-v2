import { Signal, derived, signal, cleanup, context } from "impact-app";
import { useGlobalContext } from "../useGlobalContext";
import { FamilyDTO, UserDTO, WeekDTO } from "../useGlobalContext/firebase";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { Timestamp } from "firebase/firestore";

export type Props = {
  user: UserDTO;
  family: FamilyDTO;
};

export const useAppContext = context((props: Props) => {
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
    const weekPromise = signal(
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

    const weekTodosPromise = signal(
      firebase.getDocs(weekTodosCollection).then(collectionToLookupRecord),
    );

    const disposeWeekSnapshot = firebase.onDocSnapshot(
      weeksCollection,
      weekId,
      (update) => {
        weekPromise.value = Promise.resolve(update);
      },
    );

    const disposeWeekTodosSnapshot = firebase.onCollectionSnapshot(
      weekTodosCollection,
      (update) => {
        weekTodosPromise.value = Promise.resolve(
          collectionToLookupRecord(update),
        );
      },
    );

    return {
      weekPromise,
      weekTodosPromise,
      dispose() {
        disposeWeekSnapshot();
        disposeWeekTodosSnapshot();
      },
    };
  });

  const dinnersPromise = signal(
    firebase.getDocs(dinnersCollection).then(sortByCreated),
  );
  const imageUrlPromises: Record<string, Signal<Promise<string | null>>> = {};
  const todosPromise = signal(firebase.getDocs(todosCollection));
  const todosWithCheckList = derived(() =>
    todosPromise.value.status === "fulfilled"
      ? todosPromise.value.value.filter((todo) => Boolean(todo.checkList))
      : [],
  );
  const groceriesPromise = signal(firebase.getDocs(groceriesCollection));

  cleanup(previousWeek.dispose);
  cleanup(currentWeek.dispose);
  cleanup(nextWeek.dispose);

  cleanup(
    firebase.onCollectionSnapshot(todosCollection, (update) => {
      todosPromise.value = Promise.resolve(update);
    }),
  );

  cleanup(
    firebase.onCollectionSnapshot(dinnersCollection, (update) => {
      dinnersPromise.value = Promise.resolve(sortByCreated(update));
    }),
  );

  cleanup(
    firebase.onCollectionSnapshot(
      groceriesCollection,
      (update) => (groceriesPromise.value = Promise.resolve(update)),
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
    getDinners() {
      return dinnersPromise.value;
    },
    getGroceries() {
      return groceriesPromise.value;
    },
    getTodos() {
      return todosPromise.value;
    },
    weeks: {
      previous: {
        id: previousWeekId,
        getWeek() {
          return previousWeek.weekPromise.value;
        },
        getWeekTodos() {
          return previousWeek.weekTodosPromise.value;
        },
      },
      current: {
        id: currentWeekId,
        getWeek() {
          return currentWeek.weekPromise.value;
        },
        getWeekTodos() {
          return currentWeek.weekTodosPromise.value;
        },
      },
      next: {
        id: nextWeekId,
        getWeek() {
          return nextWeek.weekPromise.value;
        },
        getWeekTodos() {
          return nextWeek.weekTodosPromise.value;
        },
      },
    },
    getImageUrl(collection: string, id: string) {
      const ref = collection + "/" + id;

      let imageUrl = imageUrlPromises[ref];

      if (!imageUrl) {
        imageUrl = imageUrlPromises[ref] = signal(
          firebase.getImageUrl(ref).catch(() => null),
        );
      }

      return imageUrl.value;
    },
  };
});

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
