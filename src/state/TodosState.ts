import { reactive } from "mobx-lite";
import { Environment } from "../environment";
import { FamilyPersistence, TodoDTO } from "../environment/Persistence";
import { FamilyScrumState } from "./FamilyScrumState";
import { TodoState } from "./TodoState";
import { getNextWeekId } from "../utils";

export type TodosState = ReturnType<typeof TodosState>;

type Params = {
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrumState;
  env: Environment;
  onDispose: (dispose: () => void) => void;
};

export function TodosState({
  familyPersistence,
  onDispose,
  familyScrum,
  env,
}: Params) {
  const nextWeekTodosApi = familyPersistence.createWeekTodosApi(
    getNextWeekId()
  );
  const todos = reactive({
    familyScrum,
    todos: [] as TodoState[],
    get todosWithCheckList(): TodoState[] {
      return todos.todos.filter((todo) => Boolean(todo.checkList.length));
    },
    addTodo,
  });

  onDispose(
    familyPersistence.todos.subscribeAll((data) => {
      todos.todos = data.map(createTodo);
    })
  );

  return reactive.readonly(todos);

  function createTodo(data: TodoDTO) {
    return TodoState({
      data,
      familyPersistence,
      familyScrum,
      nextWeekTodosApi,
    });
  }

  function addTodo(description: string) {
    familyPersistence.todos.set({
      id: familyPersistence.todos.createId(),
      description,
      created: env.persistence.createTimestamp(),
      modified: env.persistence.createTimestamp(),
    });
  }
}
