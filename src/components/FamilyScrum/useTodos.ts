import { reactive } from "bonsify";
import { useEnv } from "../../environments";
import { getNextWeekId } from "../../utils";
import { useReactiveEffect } from "use-reactive-react";
import {
  TodoDTO,
  WeekTodoActivityDTO,
} from "../../environments/Browser/Persistence";

export type Todos = {
  todos: TodoDTO[];
  todosWithCheckList: TodoDTO[];
  add(description: string): void;
  archive(id: string): void;
  addCheckListItem(id: string, description: string): void;
  setAssignment(id: string, weekDayIndex: number, active: boolean): void;
};

type Params = {
  familyId: string;
  userId: string;
};

export function useTodos({ familyId, userId }: Params): Todos {
  const env = useEnv();
  const familyPersistence = env.persistence.getFamilyApi(familyId);
  const nextWeekTodosApi = familyPersistence.getWeekTodosApi(getNextWeekId());
  const todos = reactive<Todos>({
    todos: [],
    get todosWithCheckList(): TodoDTO[] {
      return todos.todos.filter((todo) => Boolean(todo.checkList?.length));
    },
    add,
    archive,
    addCheckListItem,
    setAssignment,
  });

  useReactiveEffect(() =>
    familyPersistence.todos.subscribeAll((data) => {
      todos.todos = data;
    })
  );

  return reactive.readonly(todos);

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
