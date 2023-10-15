import { mutation, query, useCleanup, useStore } from "impact-app";
import {
  UserDTO,
  WeekDTO,
  WeekDinnersDTO,
  WeekTodoActivity,
  useFirebase,
} from "./FirebaseStore";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";

export function WeeksStore(user: UserDTO) {
  const firebase = useFirebase();
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();
  const weeksCollection = firebase.collections.weeks(user.familyId);
  const nextWeekTodosCollection = firebase.collections.weekTodos(
    user.familyId,
    nextWeekId,
  );

  // We map over three previous, current and next week to get and subscribe to
  // the week dinners and todos of the week
  const [previous, current, next] = [
    previousWeekId,
    currentWeekId,
    nextWeekId,
  ].map((weekId) => {
    const weekQuery = query(() =>
      // We default to an empty document
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

    const weekTodosQuery = query(() => firebase.getDocs(weekTodosCollection));

    const disposeWeekSnapshot = firebase.onDocSnapshot(
      weeksCollection,
      weekId,
      (update) => {
        weekQuery.set(update);
      },
    );

    const disposeWeekTodosSnapshot = firebase.onCollectionSnapshot(
      weekTodosCollection,
      (update) => {
        weekTodosQuery.set(update);
      },
    );

    return {
      weekQuery,
      weekTodosQuery,
      dispose() {
        disposeWeekSnapshot();
        disposeWeekTodosSnapshot();
      },
    };
  });

  useCleanup(previous.dispose);
  useCleanup(current.dispose);
  useCleanup(next.dispose);

  return {
    previousWeek: previous.weekQuery,
    previousWeekTodos: previous.weekTodosQuery,
    currentWeek: current.weekQuery,
    currentWeekTodos: current.weekTodosQuery,
    nextWeek: next.weekQuery,
    nextWeekTodos: next.weekTodosQuery,
    // We need to run a transaction here because multiple users can be editing this at the same time
    setNextWeekTodoActivity: mutation(
      (todoId: string, weekdayIndex: number, active: boolean) =>
        firebase.transactDoc(nextWeekTodosCollection, todoId, (data) => {
          const weekTodoActivity: WeekTodoActivity = data?.activityByUserId[
            user.id
          ] ?? [false, false, false, false, false, false, false];

          return {
            id: todoId,
            activityByUserId: {
              ...data?.activityByUserId,
              [user.id]: [
                ...weekTodoActivity.slice(0, weekdayIndex),
                active,
                ...weekTodoActivity.slice(weekdayIndex + 1),
              ] as WeekTodoActivity,
            },
          };
        }),
    ),
    setNextWeekDinners: mutation(async (dinners: WeekDinnersDTO) => {
      firebase.setDoc(weeksCollection, {
        id: nextWeekId,
        dinners,
      });
    }),
  };
}

export const useWeeks = () => useStore(WeeksStore);
