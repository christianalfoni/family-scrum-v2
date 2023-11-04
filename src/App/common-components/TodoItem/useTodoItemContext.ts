import { signal } from "impact-signal";
import { cleanup, context } from "impact-context";
import { useAppContext } from "../../useAppContext";
import { TodoDTO } from "../../../useGlobalContext/firebase";
import { useGlobalContext } from "../../../useGlobalContext";

function TodoItemContext({ data }: { data: TodoDTO }) {
  const { firebase } = useGlobalContext();
  const { user } = useAppContext();

  const todo = signal(data);
  const todosCollection = firebase.collections.todos(user.familyId);

  cleanup(
    firebase.onDocSnapshot(todosCollection, data.id, (update) => {
      todo.value = update;
    }),
  );

  return {
    get todo() {
      return todo.value;
    },
    archiveTodo() {},
    setCheckListItemCompleted(index: number, completed: boolean) {},
    addCheckListItem(title: string) {},
    removeCheckListItem(index: number) {},
  };
}

export const useTodoItemContext = context(TodoItemContext);
