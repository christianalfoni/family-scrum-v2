import { reactive } from "bonsify";
import { Environment } from "../environments";
import {
  FamilyPersistence,
  TodoDTO,
} from "../environments/Browser/Persistence";
import { FamilyScrum } from "./FamilyScrum";
import { Todo } from "./Todo";

export type Todos = {
  familyScrum: FamilyScrum;
  todos: Todo[];
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
  const todos = reactive<Todos>({
    familyScrum,
    todos: [],
    addTodo,
  });

  onDispose(
    familyPersistence.todos.subscribeAll((data) => {
      todos.todos = data.map(createTodo);
    })
  );

  return todos;

  function createTodo(data: TodoDTO) {
    return Todo({ data, familyPersistence, familyScrum });
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
