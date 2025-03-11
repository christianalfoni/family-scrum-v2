import { reactive } from "bonsify";
import { Environment } from "../environments";
import {
  FamilyPersistence,
  TodoDTO,
  WeekTodosApi,
} from "../environments/Browser/Persistence";
import { FamilyScrum } from "./FamilyScrum";
import { Todo } from "./Todo";
import { getNextWeekId } from "../utils";

export type Todos = {
  familyScrum: FamilyScrum;
  todos: Todo[];
  todosWithCheckList: Todo[];
  addTodo(description: string): void;
};

type Params = {
  familyPersistence: FamilyPersistence;
  familyScrum: FamilyScrum;
  env: Environment;
  onDispose: (dispose: () => void) => void;
};

export function Todos({
  familyPersistence,
  onDispose,
  familyScrum,
  env,
}: Params): Todos {
  const nextWeekTodosApi = familyPersistence.createWeekTodosApi(
    getNextWeekId()
  );
  const todos = reactive<Todos>({
    familyScrum,
    todos: [],
    get todosWithCheckList(): Todo[] {
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
    return Todo({ data, familyPersistence, familyScrum, nextWeekTodosApi });
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
