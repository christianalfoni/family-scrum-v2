import { signal, cleanup, store } from "impact-app";
import { UserDTO, WeekDTO, useFirebase } from "./FirebaseStore";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";

export function WeeksStore(user: UserDTO) {
  const firebase = useFirebase();
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();
  const weeksCollection = firebase.collections.weeks(user.familyId);

  // We map over three previous, current and next week to get and subscribe to
  // the week dinners and todos of the week
  const [previous, current, next] = [
    previousWeekId,
    currentWeekId,
    nextWeekId,
  ].map((weekId) => {
    // We default to an empty document
    const week = signal(
      firebase.getDoc(weeksCollection, weekId).catch(
        (): WeekDTO => ({
          id: weekId,
          dinners: [null, null, null, null, null, null, null],
        }),
      ),
    );
    const weekTodosCollection = firebase.collections.weekTodos(
      user.familyId,
      weekId,
    );

    const weekTodos = signal(firebase.getDocs(weekTodosCollection));

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
        weekTodos.value = Promise.resolve(update);
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

  cleanup(previous.dispose);
  cleanup(current.dispose);
  cleanup(next.dispose);

  return {
    get previous() {
      return {
        id: previousWeekId,
        week: previous.week.value,
        weekTodos: previous.weekTodos.value,
      };
    },
    get current() {
      return {
        id: currentWeekId,
        week: current.week.value,
        weekTodos: current.weekTodos.value,
      };
    },
    get next() {
      return {
        id: nextWeekId,
        week: next.week.value,
        weekTodos: next.weekTodos.value,
      };
    },
  };
}

export const useWeeks = () => store(WeeksStore);
