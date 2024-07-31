import {
  collectionToLookupRecord,
  getCurrentWeekId,
  getNextWeekId,
  getPreviousWeekId,
} from "@/utils";
import { Firebase, UserDTO, WeekDTO } from "../firebase";
import { signal } from "impact-react";

export type Weeks = ReturnType<typeof createWeeks>;

export async function createWeeks(firebase: Firebase, user: UserDTO) {
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();
  const weeksCollection = firebase.collections.weeks(user.familyId);

  // We map over the previous, current and next week to get and subscribe to
  // the week dinners and todos of the week
  const weekIds = [previousWeekId, currentWeekId, nextWeekId];
  const [previousWeek, currentWeek, nextWeek] = await Promise.all(
    weekIds.map(async (weekId) => {
      // We default to an empty document
      const week = signal(
        await firebase.getDoc(weeksCollection, weekId).then(
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

      const weekTodos = signal(
        await firebase
          .getDocs(weekTodosCollection)
          .then(collectionToLookupRecord)
      );

      const disposeWeekSnapshot = firebase.onDocSnapshot(
        weeksCollection,
        weekId,
        (update) => {
          week.value = Promise.resolve(update);
        }
      );

      const disposeWeekTodosSnapshot = firebase.onCollectionSnapshot(
        weekTodosCollection,
        (update) => {
          weekTodos.value = Promise.resolve(collectionToLookupRecord(update));
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
    })
  );

  return {
    dispose() {},
  };
}
