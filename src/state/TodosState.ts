import { reactive } from "mobx-lite";
import { Environment } from "../environment";
import {
  CheckListItemDTO,
  FamilyPersistence,
  TodoDTO,
  UserDTO,
} from "../environment/Persistence";

export type TodoDTOWithCheckList = Omit<TodoDTO, "checkList"> & {
  checkList: CheckListItemDTO[];
};

export type NewTodo = Pick<
  TodoDTO,
  "description" | "date" | "time" | "checkList"
>;

type Params = {
  familyPersistence: FamilyPersistence;
  env: Environment;
  user: UserDTO;
};

export function TodosState({ familyPersistence, env, user }: Params) {
  const todoQueries = {} as Record<string, reactive.Query<TodoDTO>>;
  const state = reactive({
    todosQuery: reactive.query(familyPersistence.todos.getAll),
    get todosWithCheckList() {
      return (state.todosQuery.value || []).filter(
        (todo): todo is TodoDTOWithCheckList => Boolean(todo.checkList)
      );
    },
    queryTodo,
    addTodoMutation: reactive.mutation(addTodo),
    updateTodoMutation: reactive.mutation(updateTodo),
    archiveTodoMutation: reactive.mutation(archiveTodo),
    addCheckListItemMutation: reactive.mutation(addCheckListItem),
    removeCheckListItemMutation: reactive.mutation(removeCheckListItem),
    toggleCheckListItemMutation: reactive.mutation(toggleCheckListItem),
    subscribe,
  });

  return reactive.readonly(state);

  function subscribe() {
    return familyPersistence.todos.subscribeChanges(() => {
      state.todosQuery.revalidate();
    });
  }

  async function updateTodo(
    id: string,
    todo: Pick<TodoDTO, "description" | "checkList" | "date" | "time">
  ) {
    await familyPersistence.todos.update(id, todo);
    await state.todosQuery.revalidate();

    return true;
  }

  function queryTodo(todoId: string) {
    if (!todoQueries[todoId]) {
      todoQueries[todoId] = reactive.query(() =>
        familyPersistence.todos.get(todoId)
      );
    }

    return todoQueries[todoId];
  }

  async function archiveTodo(todoId: string) {
    await familyPersistence.todos.delete(todoId);
    await state.todosQuery.revalidate();
  }

  async function addTodo(newTodo: NewTodo) {
    await familyPersistence.todos.set({
      ...newTodo,
      id: familyPersistence.todos.createId(),
      created: env.persistence.createServerTimestamp(),
      modified: env.persistence.createServerTimestamp(),
    });
    await state.todosQuery.revalidate();

    return true;
  }

  async function addCheckListItem(todoId: string, description: string) {
    await familyPersistence.todos.update(todoId, (data) => ({
      ...data,
      checkList: [
        ...(data.checkList || []),
        {
          title: description,
          completed: false,
        },
      ],
    }));
    await state.todosQuery.revalidate();
  }

  async function removeCheckListItem(todoId: string, index: number) {
    await familyPersistence.todos.update(todoId, (data) => ({
      ...data,
      checkList: data.checkList?.filter((_, itemIndex) => itemIndex !== index),
    }));
    await state.todosQuery.revalidate();
  }

  async function toggleCheckListItem(todoId: string, index: number) {
    await familyPersistence.todos.update(todoId, (data) => ({
      ...data,
      checkList: data.checkList?.map((checkListItem, i) => {
        if (i !== index) return checkListItem;

        const completed = !checkListItem.completed;

        return completed
          ? {
              completed: true,
              completedByUserId: user.id,
              title: checkListItem.title,
            }
          : {
              completed: false,
              title: checkListItem.title,
            };
      }),
    }));
    await state.todosQuery.revalidate();
  }
}
