import {
  CheckListItemDTO,
  FamilyPersistence,
  TodoDTO,
  WeekTodoActivityDTO,
  WeekTodosApi,
} from "../environment/Persistence";
import { reactive } from "mobx-lite";
import { FamilyScrumState } from "./FamilyScrumState";
import { CheckListItemState } from "./CheckListItemState";

export type TodoState = ReturnType<typeof TodoState>;

type Params = {
  data: TodoDTO;
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrum;
  nextWeekTodosApi: WeekTodosApi;
};

export function TodoState({
  data,
  familyPersistence,
  familyScrum,
  nextWeekTodosApi,
}: Params) {
  const todo = reactive({
    ...data,
    get checkList(): CheckListItemState[] {
      return checkList;
    },
    archive,
    addCheckListItem,
    setAssignment,
  });

  const checkList = data.checkList?.map(createCheckListItem) ?? [];

  return reactive.readonly(todo);

  function createCheckListItem(data: CheckListItemDTO, index: number) {
    return CheckListItemState({
      data,
      index,
      familyPersistence,
      familyScrum,
      todo,
    });
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
    const user = familyScrum.session.user;

    nextWeekTodosApi.upsert(todo.id, (data) => {
      const userActivity = data?.activityByUserId[user.id] ?? [
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
            [user.id]: updatedActivity,
          },
        };
      }

      return {
        ...data,
        activityByUserId: {
          ...data.activityByUserId,
          [user.id]: updatedActivity,
        },
      };
    });
  }
}
