import {
  CheckListItemDTO,
  FamilyPersistence,
  TodoDTO,
  WeekTodoActivityDTO,
  WeekTodosApi,
} from "../../environments/Browser/Persistence";
import { reactive } from "bonsify";
import { FamilyScrum } from "../FamilyScrum";
import { CheckListItem } from "./CheckListItem";
import { user } from "../../environments/Browser/Persistence/converters";

export type Todo = Omit<TodoDTO, "checkList"> & {
  checkList: CheckListItem[];
  archive(): void;
  addCheckListItem(description: string): void;
  setAssignment(weekDayIndex: number, active: boolean): void;
};

type Params = {
  data: TodoDTO;
  familyPersistence: FamilyPersistence;
  userId: string;
  nextWeekTodosApi: WeekTodosApi;
};

export function Todo({
  data,
  familyPersistence,
  userId,
  nextWeekTodosApi,
}: Params): Todo {
  const todo = reactive<Todo>({
    ...data,
    get checkList(): CheckListItem[] {
      return checkList;
    },
    archive,
    addCheckListItem,
    setAssignment,
  });

  const checkList = data.checkList?.map(createCheckListItem) ?? [];

  return reactive.readonly(todo);

  function createCheckListItem(data: CheckListItemDTO, index: number) {
    return CheckListItem({ data, index, familyPersistence, userId, todo });
  }

  function archive() {
    familyPersistence.todos.delete(todo.id);
  }

  function addCheckListItem(description: string) {
    familyPersistence.todos.update(todo.id, (data) => ({
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

  function setAssignment(weekDayIndex: number, active: boolean) {
    nextWeekTodosApi.upsert(todo.id, (data) => {
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
          id: todo.id,
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
