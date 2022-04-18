import { StatesReducer, useCommandEffect } from "react-states";
import {
  createReducer,
  useEnvironment,
  useReducer,
  createReducerHandlers,
} from "../../environment-interface";
import {
  CheckListItemsByTodoId,
  TodoDTO,
} from "../../environment-interface/storage";
import * as selectors from "../../selectors";

type DateState =
  | {
      state: "INACTIVE";
    }
  | {
      state: "ACTIVE";
      date: number;
    };

type TimeState =
  | {
      state: "INACTIVE";
    }
  | {
      state: "ACTIVE";
      time: string;
    };

type ChecklistState =
  | {
      state: "INACTIVE";
    }
  | {
      state: "ACTIVE";
      items: Array<{ title: string; id?: string }>;
    };

type BaseState = {
  description: string;
  date: DateState;
  time: TimeState;
  checkList: ChecklistState;
};

type State = BaseState &
  (
    | {
        state: "VALID";
      }
    | {
        state: "INVALID";
      }
  );

type Action =
  | {
      type: "DESCRIPTION_CHANGED";
      description: string;
    }
  | {
      type: "DATE_TOGGLED";
    }
  | {
      type: "DATE_CHANGED";
      date: number;
    }
  | {
      type: "TIME_TOGGLED";
    }
  | {
      type: "TIME_CHANGED";
      time: string;
    }
  | {
      type: "CHECKLIST_TOGGLED";
    }
  | {
      type: "CHECKLIST_ITEM_ADDED";
      title: string;
    }
  | {
      type: "CHECKLIST_ITEM_REMOVED";
      index: number;
    }
  | {
      type: "ADD_TODO";
    };

type Command = {
  cmd: "ADD_TODO";
  description: string;
  date?: number;
  time?: string;
  checkList?: Array<{ title: string; id?: string }>;
};

type EditTodoReducer = StatesReducer<State, Action, Command>;

const handlers = createReducerHandlers<EditTodoReducer>({
  DESCRIPTION_CHANGED: ({ state, action: { description }, transition }) =>
    transition({
      ...state,
      description,
      state: description ? "VALID" : "INVALID",
    }),

  DATE_TOGGLED: ({ state, transition }) =>
    transition({
      ...state,
      date:
        state.date.state === "ACTIVE"
          ? {
              state: "INACTIVE",
            }
          : {
              state: "ACTIVE",
              date: Date.now(),
            },
    }),
  DATE_CHANGED: ({ state, action: { date }, transition }) =>
    transition({
      ...state,
      date:
        state.date.state === "ACTIVE"
          ? {
              ...state.date,
              date,
            }
          : state.date,
    }),

  TIME_TOGGLED: ({ state, transition }) =>
    transition({
      ...state,
      time:
        state.time.state === "ACTIVE"
          ? {
              state: "INACTIVE",
            }
          : {
              state: "ACTIVE",
              time: "10:00",
            },
    }),

  TIME_CHANGED: ({ state, action: { time }, transition }) =>
    transition({
      ...state,
      time:
        state.time.state === "ACTIVE"
          ? {
              ...state.time,
              time,
            }
          : state.time,
    }),
  CHECKLIST_TOGGLED: ({ state, transition }) =>
    transition({
      ...state,
      checkList:
        state.checkList.state === "ACTIVE"
          ? {
              state: "INACTIVE",
            }
          : {
              state: "ACTIVE",
              items: [],
            },
    }),
  CHECKLIST_ITEM_ADDED: ({ state, action: { title }, transition }) =>
    transition({
      ...state,
      checkList:
        state.checkList.state === "ACTIVE"
          ? {
              state: "ACTIVE",
              items: [...state.checkList.items, { title }],
            }
          : state.checkList,
    }),
  CHECKLIST_ITEM_REMOVED: ({ state, action: { index }, transition }) =>
    transition({
      ...state,
      checkList:
        state.checkList.state === "ACTIVE"
          ? {
              state: "ACTIVE",
              items: [
                ...state.checkList.items.slice(0, index),
                ...state.checkList.items.slice(index + 1),
              ],
            }
          : state.checkList,
    }),
});

export const reducer = createReducer<EditTodoReducer>({
  INVALID: handlers,
  VALID: {
    ...handlers,
    ADD_TODO: ({ state, transition }) =>
      transition(state, {
        cmd: "ADD_TODO",
        description: state.description,
        checkList:
          state.checkList.state === "ACTIVE"
            ? state.checkList.items
            : undefined,
        date: state.date.state === "ACTIVE" ? state.date.date : undefined,
        time: state.time.state === "ACTIVE" ? state.time.time : undefined,
      }),
  },
});

export const useEditTodo = ({
  todo,
  checkListItemsByTodoId,
  initialState,
  onExit,
}: {
  todo?: TodoDTO;
  checkListItemsByTodoId: CheckListItemsByTodoId;
  initialState?: State;
  onExit: () => void;
}) => {
  const { storage } = useEnvironment();
  const todoReducer = useReducer(
    "EditTodo",
    reducer,
    initialState ||
      (todo
        ? {
            state: "VALID",
            description: todo.description,
            checkList: todo.checkList
              ? {
                  state: "ACTIVE",
                  items: selectors
                    .sortedCheckListItems(checkListItemsByTodoId[todo.id] || {})
                    .map((item) => ({ title: item.title, id: item.id })),
                }
              : {
                  state: "INACTIVE",
                },
            date: todo.date
              ? {
                  state: "ACTIVE",
                  date: todo.date,
                }
              : {
                  state: "INACTIVE",
                },
            time: todo.time
              ? {
                  state: "ACTIVE",
                  time: todo.time,
                }
              : {
                  state: "INACTIVE",
                },
          }
        : {
            state: "INVALID",
            description: "",
            checkList: {
              state: "INACTIVE",
            },
            date: {
              state: "INACTIVE",
            },
            time: {
              state: "INACTIVE",
            },
          })
  );

  const [state] = todoReducer;

  useCommandEffect(
    state,
    "ADD_TODO",
    ({ description, date, time, checkList }) => {
      const id = storage.createTodoId();
      storage.storeTodo(
        {
          id: todo ? todo.id : id,
          description,
          date,
          time,
        },
        checkList
          ? checkList.map(({ title, id }) => ({
              id: id || storage.createCheckListItemId(),
              title,
            }))
          : undefined
      );
      onExit();
    }
  );

  return todoReducer;
};
