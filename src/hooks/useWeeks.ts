import { collection, getFirestore, doc, onSnapshot } from "firebase/firestore";
import { useSubscriptionCache } from "../useCache";
import { FAMILY_DATA_COLLECTION, useFirebase } from "../useFirebase";
import { getPreviousWeekId, getCurrentWeekId, getNextWeekId } from "../utils";
import { User } from "./useCurrentUser";

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
