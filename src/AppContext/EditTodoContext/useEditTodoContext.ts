import { TodoDTO } from "../../useGlobalContext/firebase";
import { derived, signal, context } from "impact-app";
import { useGlobalContext } from "../../useGlobalContext";
import { useAppContext } from "../useAppContext";
import { produce } from "immer";
import { Timestamp } from "firebase/firestore";

export type Props = { todo?: TodoDTO };

export const useEditTodoContext = context(EditTodoContext);

function EditTodoContext(props: Props) {
  const { todo: initialTodo } = props;

  const { firebase, views } = useGlobalContext();
  const { user } = useAppContext();

  const todosCollection = firebase.collections.todos(user.familyId);

  const todo = signal<TodoDTO>(
    initialTodo || {
      id: firebase.createId(todosCollection),
      description: "",
      created: firebase.createServerTimestamp(),
      modified: firebase.createServerTimestamp(),
    },
  );
  const newCheckListItemTitle = signal("");

  const isValid = derived(() => Boolean(todo.value.description.length));

  return {
    get isValid() {
      return isValid.value;
    },
    get description() {
      return todo.value.description;
    },
    get date() {
      return todo.value.date;
    },
    get checkList() {
      return todo.value.checkList;
    },
    get time() {
      return todo.value.time;
    },
    get newCheckListItemTitle() {
      return newCheckListItemTitle.value;
    },
    changeDescription(description: string) {
      todo.value = produce(todo.value, (draft) => {
        draft.description = description;
      });
    },
    setDate(date: Date) {
      todo.value = produce(todo.value, (draft) => {
        draft.date = Timestamp.fromDate(date);
      });
    },
    unsetDate() {
      todo.value = produce(todo.value, (draft) => {
        delete draft.date;
      });
    },
    setTime(time: string) {
      todo.value = produce(todo.value, (draft) => {
        draft.time = time;
      });
    },
    unsetTime() {
      todo.value = produce(todo.value, (draft) => {
        delete draft.time;
      });
    },
    setCheckList() {
      todo.value = produce(todo.value, (draft) => {
        draft.checkList = [];
      });
    },
    unsetCheckList() {
      todo.value = produce(todo.value, (draft) => {
        delete draft.checkList;
      });
    },
    addCheckListItem() {
      if (!newCheckListItemTitle.value) {
        return;
      }

      todo.value = produce(todo.value, (draft) => {
        if (draft.checkList) {
          draft.checkList.push({
            completed: false,
            title: newCheckListItemTitle.value,
          });
        }
      });
      newCheckListItemTitle.value = "";
    },
    removeCheckListItem(index: number) {
      todo.value = produce(todo.value, (draft) => {
        if (draft.checkList) {
          draft.checkList.splice(index, 1);
        }
      });
    },
    changeNewCheckListItemTitle(title: string) {
      newCheckListItemTitle.value = title;
    },
    submit() {
      firebase.setDoc(todosCollection, {
        ...todo.value,
        modified: firebase.createServerTimestamp(),
      });
      views.pop();
    },
  };
}
