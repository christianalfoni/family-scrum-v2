import { reactive } from "mobx-lite";
import {
  FamilyPersistence,
  UserDTO,
  WeekTodoActivityDTO,
  WeekTodoDTO,
} from "../environment/Persistence";

type Params = {
  weekId: string;
  user: UserDTO;
  familyPersistence: FamilyPersistence;
};

export function WeekState({ weekId, user, familyPersistence }: Params) {
  const weekTodosApi = familyPersistence.createWeekTodosApi(weekId);
  const weekTodoQueries: Record<string, reactive.Query<WeekTodoDTO>> = {};

  const state = reactive({
    id: weekId,
    weekQuery: reactive.query(() => familyPersistence.weeks.get(weekId)),
    weekTodosQuery: reactive.query(weekTodosApi.getAll),
    queryWeekTodo,
    subscribe,
    setAssignmentsMutation: reactive.mutation(setAssignments),
  });

  return state;

  function subscribe() {
    const disposeWeekTodosSubscription = weekTodosApi.subscribeChanges(() => {
      state.weekTodosQuery.revalidate();
    });
    // TODO: When we get the IDs here, check the actual ID
    const disposeWeekSubscription = familyPersistence.weeks.subscribeChanges(
      () => {
        state.weekTodosQuery.revalidate();
      }
    );

    return () => {
      disposeWeekTodosSubscription();
      disposeWeekSubscription();
    };
  }

  function queryWeekTodo(id: string) {
    if (!weekTodoQueries[id]) {
      weekTodoQueries[id] = reactive.query(() => weekTodosApi.get(id));
    }

    return weekTodoQueries[id];
  }

  async function setAssignments(
    todoId: string,
    assignments: WeekTodoActivityDTO
  ) {
    await weekTodosApi.upsert(todoId, (data) => {
      if (!data) {
        return {
          id: todoId,
          activityByUserId: {
            [user.id]: assignments,
          },
        };
      }

      return {
        ...data,
        activityByUserId: {
          ...data.activityByUserId,
          [user.id]: assignments,
        },
      };
    });

    await weekTodoQueries[todoId].revalidate();
  }
}
