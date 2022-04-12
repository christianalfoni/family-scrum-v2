import { createContext, useContext } from "react";
import {
  StatesReducer,
  StatesHandlers,
  StatesTransition,
  useCommandEffect,
} from "react-states";
import {
  useEnvironment,
  createReducer,
  useReducer,
} from "../../environment-interface";

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
      items: string[];
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
  checkList?: string[];
};

type AddTodoFeature = StatesReducer<State, Action, Command>;

type Transition = StatesTransition<AddTodoFeature>;

const featureContext = createContext({} as AddTodoFeature);

const handlers: StatesHandlers<AddTodoFeature> = {
  DESCRIPTION_CHANGED: (state, { description }): Transition => ({
    ...state,
    description,
    state: description ? "VALID" : "INVALID",
  }),
  DATE_TOGGLED: (state): Transition => ({
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
  DATE_CHANGED: (state, { date }): Transition => ({
    ...state,
    date:
      state.date.state === "ACTIVE"
        ? {
            ...state.date,
            date,
          }
        : state.date,
  }),

  TIME_TOGGLED: (state): Transition => ({
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

  TIME_CHANGED: (state, { time }): Transition => ({
    ...state,
    time:
      state.time.state === "ACTIVE"
        ? {
            ...state.time,
            time,
          }
        : state.time,
  }),

  CHECKLIST_TOGGLED: (state): Transition => ({
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

  CHECKLIST_ITEM_ADDED: (state, { title }): Transition => ({
    ...state,
    checkList:
      state.checkList.state === "ACTIVE"
        ? {
            state: "ACTIVE",
            items: [...state.checkList.items, title],
          }
        : state.checkList,
  }),

  CHECKLIST_ITEM_REMOVED: (state, { index }): Transition => ({
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
};

const reducer = createReducer<AddTodoFeature>({
  INVALID: handlers,
  VALID: {
    ...handlers,
    ADD_TODO: (state): Transition => [
      state,
      {
        cmd: "ADD_TODO",
        description: state.description,
        checkList:
          state.checkList.state === "ACTIVE"
            ? state.checkList.items
            : undefined,
        date: state.date.state === "ACTIVE" ? state.date.date : undefined,
        time: state.time.state === "ACTIVE" ? state.time.time : undefined,
      },
    ],
  },
});

export const useFeature = () => useContext(featureContext);

export const Feature = ({
  familyId,
  userId,
  children,
  initialState = {
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
  },
}: {
  familyId: string;
  userId: string;
  children: React.ReactNode;
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer("AddTodo", reducer, initialState);
  const [state] = feature;

  useCommandEffect(
    state,
    "ADD_TODO",
    ({ description, date, time, checkList }) => {
      const id = storage.createTodoId();
      storage.storeTodo(
        familyId,
        {
          id,
          description,
          date,
          time,
          created: Date.now(),
          modified: Date.now(),
          checkList: Boolean(checkList),
        },
        checkList
          ? checkList.map((title) => ({
              completed: false,
              created: Date.now(),
              id: storage.createCheckListId(),
              modified: Date.now(),
              title,
              todoId: id,
            }))
          : checkList
      );
    }
  );

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
