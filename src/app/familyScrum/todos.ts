import { signal, derived } from "impact-react";
import { Firebase, TodoDTO, UserDTO } from "../firebase";

export type Todos = ReturnType<typeof createTodos>;

type EditedTodo = Omit<TodoDTO, "id" | "created" | "modified">;

export async function createTodos(firebase: Firebase, user: UserDTO) {
  const todosCollection = firebase.collections.todos(user.familyId);
  const todos = signal(await firebase.getDocs(todosCollection));
  const todosWithCheckList = derived(() =>
    todos().filter((todo) => Boolean(todo.checkList))
  );
  const disposeSnapshotListener = firebase.onCollectionSnapshot(
    todosCollection,
    todos
  );
  const savingTodo = signal<Promise<void> | undefined>(undefined);

  return {
    get todos() {
      return todos();
    },
    get todosWithCheckList() {
      return todosWithCheckList();
    },
    get savingTodo() {
      return savingTodo();
    },
    addTodo(newTodo: EditedTodo) {
      const todo = {
        ...newTodo,
        id: firebase.createId(todosCollection),
        created: firebase.createServerTimestamp(),
        modified: firebase.createServerTimestamp(),
      };

      todos((current) => {
        current.push(todo);
      });

      savingTodo(firebase.setDoc(todosCollection, todo));
    },
    updateTodo(updatedTodo: EditedTodo) {},
    removeTodo(id: string) {},
    dispose() {
      disposeSnapshotListener();
    },
  };
}
