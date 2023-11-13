import { signal, cleanup, context } from "impact-app";
import { useAppContext } from "../../../useAppContext";
import { useGlobalContext } from "../../../../useGlobalContext";
import {
  WeekTodoActivity,
  WeekTodoDTO,
} from "../../../../useGlobalContext/firebase";

export type Props = { todoId: string; weekTodo?: WeekTodoDTO };

export const usePlanTodoItemContext = context((props: Props) => {
  const { todoId, weekTodo } = props;

  const { firebase } = useGlobalContext();
  const { weeks, user, family } = useAppContext();

  const nextWeekTodosCollection = firebase.collections.weekTodos(
    user.familyId,
    weeks.next.id,
  );

  const activityByUserId = signal(weekTodo?.activityByUserId ?? {});

  cleanup(
    firebase.onDocSnapshot(
      nextWeekTodosCollection,
      todoId,
      handleWeekTodoUpdate,
    ),
  );

  // We only want to update other members data as we keep the user data
  // optimistic
  function handleWeekTodoUpdate(weekTodoUpdate: WeekTodoDTO) {
    const otherMembersUpdate = Object.keys(
      weekTodoUpdate.activityByUserId,
    ).reduce<Record<string, WeekTodoActivity>>((aggr, userId) => {
      if (userId === user.id) {
        return aggr;
      }

      return {
        ...aggr,
        [userId]: weekTodoUpdate.activityByUserId[userId],
      };
    }, {});

    activityByUserId.value = {
      ...activityByUserId.value,
      ...otherMembersUpdate,
    };
  }

  const updateWeekTodoActivity = (
    weekdayIndex: number,
    active: boolean,
    maybeWeekTodoActivity?: WeekTodoActivity,
  ) => {
    const weekTodoActivity = maybeWeekTodoActivity || [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    return [
      ...weekTodoActivity.slice(0, weekdayIndex),
      active,
      ...weekTodoActivity.slice(weekdayIndex + 1),
    ] as WeekTodoActivity;
  };

  return {
    get activityByUserId() {
      return activityByUserId.value;
    },
    get familyUsers() {
      return Object.entries(family.users)
        .sort(([aUserId], [bUserId]) => {
          if (aUserId === user.id) {
            return -1;
          }
          if (bUserId === user.id) {
            return 1;
          }

          return 0;
        })
        .map(([id, user]) => ({
          ...user,
          id,
        }));
    },
    setNextWeekTodoActivity(weekdayIndex: number, active: boolean) {
      const userWeekdayActivity = updateWeekTodoActivity(
        weekdayIndex,
        active,
        activityByUserId.value[user.id],
      );

      activityByUserId.value = {
        ...activityByUserId.value,
        [user.id]: userWeekdayActivity,
      };

      console.log("WTF", userWeekdayActivity);

      firebase.transactDoc(nextWeekTodosCollection, todoId, (data) => {
        return {
          id: todoId,
          activityByUserId: {
            ...data?.activityByUserId,
            [user.id]: userWeekdayActivity,
          },
        };
      });
    },
  };
});
