import { Timestamp } from "firebase/firestore";
import { Context } from "../context";
import { DataState } from "./data";
import { FamilyScrumState } from "./familyScrum";
import { CheckListItem, FamilyPersistence, TodoDTO } from "../context/firebase";
import { reactive } from "bonsify";

/**
 * Managing complexity in React
 *
 * - Component complexity: A better pattern for components (TicTacToe)
 * - State complexity: A better pattern for state managemnt
 *   - Use the same mental model as a component
 *   - Automatic observation in components
 *   - Choose whatever state primitives you want
 *   - Strong state => component contract
 * - Part two: state machines, data fetching and more
 */

function App() {
  const [state, setState] = useState(() => ({
    count: 0,
    increase() {
      setState((state) => ({ ...state, count: state.count + 1 }));
    },
  }));
}

type CheckListItemCompleted = {
  completed: true;
  completedByUserId: string;
};

type CheckListItemNotCompleted = {
  completed: false;
};

type CheckListItemState = {
  title: string;
  state: CheckListItemCompleted | CheckListItemNotCompleted;
  toggle(): void;
  remove(): void;
};

type TodoState = {
  description: string;
  date?: Timestamp;
  time?: string;
  checkList?: CheckListItemState[];
  archive(): void;
  addCheckListItem(description: string): void;
};

export type TodosState = {
  todos: TodoState[];
  addTodo(): void;
};

type Params = {
  context: Context;
  data: DataState;
  familyScrum: FamilyScrumState;
  familyPersistence: FamilyPersistence;
};

export const createTodos = ({
  context,
  data,
  familyScrum,
  familyPersistence,
}: Params) => {
  const state = reactive<TodosState>({
    todos: data.todos.map(createTodo),
    addTodo() {},
  });

  return state;

  function createTodo(todoData: TodoDTO): TodoState {
    const todo = reactive<TodoState>({
      get description() {
        return todoData.description;
      },
      get date() {
        return todoData.date;
      },
      get time() {
        return todoData.time;
      },
      get checkList() {
        return todoData.checkList?.map(createCheckListItem) ?? [];
      },
      archive() {
        familyPersistence.todos.delete(todoData.id);
      },
      addCheckListItem(description: string) {},
    });

    return todo;

    function createCheckListItem(
      checkListItemData: CheckListItem,
      index: number
    ): CheckListItemState {
      const checkListItem = reactive<CheckListItemState>({
        get title() {
          return checkListItemData.title;
        },
        get state(): CheckListItemCompleted | CheckListItemNotCompleted {
          return checkListItemData.completed
            ? {
                completed: true,
                completedByUserId: checkListItemData.completedByUserId,
              }
            : { completed: false };
        },
        toggle() {
          familyPersistence.todos.update(todoData.id, {
            checkList: [
              ...todoData.checkList!.slice(0, index),
              checkListItemData.completed
                ? { title: checkListItemData.title, completed: false }
                : {
                    title: checkListItemData.title,
                    completed: true,
                    completedByUserId: familyScrum.session.user.id,
                  },
              ...todoData.checkList!.slice(index + 1),
            ],
          });
        },
        remove() {},
      });

      return checkListItem;
    }
  }
};
