import { useEnv } from "../../environments";
import { getNextWeekId } from "../../utils";
import {
  TodoDTO,
  WeekTodoActivityDTO,
} from "../../environments/Browser/Persistence";
import { useSignal } from "use-react-signal";
import { useEffect, useMemo } from "react";

export type Todos = ReturnType<typeof useTodos>;

type Params = {
  familyId: string;
  userId: string;
};

export function useTodos({ familyId, userId }: Params) {
  const env = useEnv();
  const familyPersistence = env.persistence.getFamilyApi(familyId);
  const nextWeekTodosApi = familyPersistence.getWeekTodosApi(getNextWeekId());
  const [todos, setTodos] = useSignal<TodoDTO[]>([]);
  const todosWithCheckList = useMemo(
    () => todos.value.filter((todo) => Boolean(todo.checkList?.length)),
    [todos.value]
  );

  useEffect(() => familyPersistence.todos.subscribeAll(setTodos), []);

  return {
    todos,
    todosWithCheckList,
    add,
    archive,
    addCheckListItem,
    setAssignment,
  };

  function add(description: string) {
    familyPersistence.todos.set({
      id: familyPersistence.todos.createId(),
      description,
      created: env.persistence.createTimestamp(),
      modified: env.persistence.createTimestamp(),
    });
  }

  function archive(todoId: string) {
    familyPersistence.todos.delete(todoId);
  }

  function addCheckListItem(todoId: string, description: string) {
    familyPersistence.todos.update(todoId, (data) => ({
      ...data,
      checkList: [
        ...(data.checkList || []),
        {
          title: description,
          completed: false,
        },
      ],
    }));
  }

  function setAssignment(
    todoId: string,
    weekDayIndex: number,
    active: boolean
  ) {
    nextWeekTodosApi.upsert(todoId, (data) => {
      const userActivity = data?.activityByUserId[userId] ?? [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ];
      const updatedActivity = [
        ...userActivity.slice(0, weekDayIndex),
        active,
        ...userActivity.slice(weekDayIndex + 1),
      ] as WeekTodoActivityDTO;

      if (!data) {
        return {
          id: todoId,
          activityByUserId: {
            [userId]: updatedActivity,
          },
        };
      }

      return {
        ...data,
        activityByUserId: {
          ...data.activityByUserId,
          [userId]: updatedActivity,
        },
      };
    });
  }
}
