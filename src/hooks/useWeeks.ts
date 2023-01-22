import {
  collection,
  getFirestore,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useSubscriptionCache } from "../useCache";
import { FAMILY_DATA_COLLECTION, useFirebase } from "./useFirebase";
import { getPreviousWeekId, getCurrentWeekId, getNextWeekId } from "../utils";
import { User } from "./useCurrentUser";
import { getFamilyDocRef } from "./useFamily";

// Each user has an array representing each day of the week,
// which holds a boolean if the todo is active or not
export type WeekTodoActivity = [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
];

export type WeekDinnersDTO = [
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null
];

export type WeekDTO = {
  // Week id is the date of each Monday (YYYYMMDD)
  id: string;
  todos: {
    [todoId: string]: {
      [userId: string]: WeekTodoActivity;
    };
  };
  dinners: WeekDinnersDTO;
};

export type Weeks = {
  previousWeek: WeekDTO;
  currentWeek: WeekDTO;
  nextWeek: WeekDTO;
};

const WEEKS_COLLECTION = "weeks";
const WEEKS_TODOS_COLLECTION = "todos";

export const useWeeks = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);

  const weekIds = {
    previousWeek: getPreviousWeekId(),
    currentWeek: getCurrentWeekId(),
    nextWeek: getNextWeekId(),
  } as const;

  return useSubscriptionCache<Weeks>(
    "weeks-" + weekIds.currentWeek,
    (setCache) => {
      const weeksCollection = collection(
        firestore,
        FAMILY_DATA_COLLECTION,
        user.familyId,
        WEEKS_COLLECTION
      );
      const initialWeeksState: Weeks = {
        previousWeek: {
          id: weekIds.previousWeek,
          todos: {},
          dinners: [null, null, null, null, null, null, null],
        },
        currentWeek: {
          id: weekIds.currentWeek,
          todos: {},
          dinners: [null, null, null, null, null, null, null],
        },
        nextWeek: {
          id: weekIds.nextWeek,
          todos: {},
          dinners: [null, null, null, null, null, null, null],
        },
      };
      const disposers: Array<() => void> = [];

      for (const key in weekIds) {
        const week = key as keyof typeof weekIds;

        const weekDocRef = doc(weeksCollection, weekIds[week]);
        const weekTodosCollection = collection(
          weekDocRef,
          WEEKS_TODOS_COLLECTION
        );

        disposers.push(
          onSnapshot(weekDocRef, (snapshot) => {
            setCache((weeks = initialWeeksState) => ({
              ...weeks,
              [week]: {
                id: weekIds[week],
                dinners: snapshot.data()?.dinners ?? weeks[week].dinners,
                todos: weeks[week].todos,
              },
            }));
          }),
          onSnapshot(weekTodosCollection, (snapshot) => {
            setCache((weeks = initialWeeksState) => ({
              ...weeks,
              [week]: {
                id: weekIds[week],
                dinners: weeks[week].dinners,
                todos: snapshot.docs.reduce<{
                  [id: string]: { [userId: string]: WeekTodoActivity };
                }>((aggr, doc) => {
                  const data = doc.data({ serverTimestamps: "estimate" });
                  aggr[doc.id] = {
                    ...data.activityByUserId,
                    // If other users are updated, we want to keep a reference to our optimistic version
                    [user.id]:
                      weeks[week]?.todos[doc.id]?.[user.id] ??
                      (data.activityByUserId[user.id] || [
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                      ]),
                  };

                  return aggr;
                }, {}),
              },
            }));
          })
        );
      }

      return () => {
        disposers.forEach((dispose) => dispose());
      };
    }
  );
};
export const useSetNextWeekTaskActivity = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);
  const weeksCache = useWeeks(user).suspend();

  return ({
    todoId,
    userId,
    weekdayIndex,
    active,
  }: {
    todoId: string;
    userId: string;
    weekdayIndex: number;
    active: boolean;
  }) => {
    const weeks = weeksCache.read().data;
    const weekId = weeks.nextWeek.id;
    const todoDocRef = doc(
      getFamilyDocRef(firestore, user),
      WEEKS_COLLECTION,
      weekId,
      WEEKS_TODOS_COLLECTION,
      todoId
    );

    const weekTodoActivity: WeekTodoActivity = weeks.nextWeek.todos[todoId]?.[
      userId
    ] ?? [false, false, false, false, false, false, false];

    weeksCache.write(
      (current) => ({
        ...current,
        nextWeek: {
          ...weeks.nextWeek,
          todos: {
            ...weeks.nextWeek.todos,
            [todoId]: {
              ...weeks.nextWeek.todos[todoId],
              [userId]: [
                ...weekTodoActivity.slice(0, weekdayIndex),
                active,
                ...weekTodoActivity.slice(weekdayIndex + 1),
              ] as WeekTodoActivity,
            },
          },
        },
      }),
      runTransaction(firestore, (transaction) =>
        transaction.get(todoDocRef).then((todoDoc) => {
          const data = todoDoc.data();
          const weekTodoActivity: WeekTodoActivity = data?.activityByUserId[
            userId
          ] ?? [false, false, false, false, false, false, false];

          const update = {
            modified: serverTimestamp(),
            activityByUserId: {
              ...data?.activityByUserId,
              [userId]: [
                ...weekTodoActivity.slice(0, weekdayIndex),
                active,
                ...weekTodoActivity.slice(weekdayIndex + 1),
              ],
            },
          };

          transaction.set(todoDocRef, update);
        })
      )
    );
  };
};

export const useSetWeekDinner = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);
  const weeksCache = useWeeks(user).suspend();

  return ({
    dinnerId,
    weekdayIndex,
  }: {
    dinnerId: string | null;
    weekdayIndex: number;
  }) => {
    const weeks = weeksCache.read().data;
    const weekId = weeks.currentWeek.id;
    const weekRef = doc(
      getFamilyDocRef(firestore, user),
      WEEKS_COLLECTION,
      weekId
    );

    const week = weeks.currentWeek;
    const updatedWeek: WeekDTO = {
      ...week,
      dinners: [
        ...week.dinners.slice(0, weekdayIndex),
        dinnerId,
        ...week.dinners.slice(weekdayIndex + 1),
      ] as WeekDinnersDTO,
    };

    const { dinners } = updatedWeek;

    weeksCache.write(
      (current) => ({
        ...current,
        [weekId]: updatedWeek,
      }),
      setDoc(weekRef, { dinners }, { merge: true })
    );
  };
};
