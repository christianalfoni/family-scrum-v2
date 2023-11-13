import { signal, cleanup, context } from "impact-app";
import { useAppContext } from "../../useAppContext";
import { TodoDTO } from "../../../useGlobalContext/firebase";
import { useGlobalContext } from "../../../useGlobalContext";
import { produce } from "immer";

export type Props = { todo: TodoDTO };

export const useTodoItemContext = context((props: Props) => {
  const { todo: initialTodo } = props;
  const id = initialTodo.id;

  const { firebase } = useGlobalContext();
  const { user } = useAppContext();

  const todosCollection = firebase.collections.todos(user.familyId);

  const todo = signal(initialTodo);

  cleanup(
    firebase.onDocSnapshot(todosCollection, id, (update) => {
      todo.value = update;
    }),
  );

  return {
    get todo() {
      return todo.value;
    },
    archiveTodo() {
      firebase.deleteDoc(todosCollection, initialTodo.id);
    },
    setCheckListItemCompleted(index: number, completed: boolean) {
      const updateTodo = (current: TodoDTO) =>
        produce(current, (draft) => {
          if (draft.checkList) {
            const title = draft.checkList[index].title;

            draft.checkList[index] = completed
              ? {
                  title,
                  completed: true,
                  completedByUserId: user.id,
                }
              : {
                  title,
                  completed: false,
                };
          }
        });

      todo.value = updateTodo(todo.value);

      firebase.transactDoc(todosCollection, id, (doc) => {
        if (doc) {
          return updateTodo(doc);
        }
      });
    },
    addCheckListItem(title: string) {
      const updateTodo = (current: TodoDTO) =>
        produce(current, (draft) => {
          if (draft.checkList) {
            draft.checkList.push({
              completed: false,
              title,
            });
          } else {
            draft.checkList = [{ completed: false, title }];
          }
        });

      todo.value = updateTodo(todo.value);

      firebase.transactDoc(todosCollection, id, (doc) => {
        if (doc) {
          return updateTodo(doc);
        }
      });
    },
    removeCheckListItem(index: number) {
      const updateTodo = (current: TodoDTO) =>
        produce(current, (draft) => {
          if (draft.checkList) {
            draft.checkList.splice(index, 1);
          }
        });

      todo.value = updateTodo(todo.value);

      firebase.transactDoc(todosCollection, id, (doc) => {
        if (doc) {
          return updateTodo(doc);
        }
      });
    },
  };
});
