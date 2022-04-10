import { createContext, useContext } from "react";
import {
  match,
  PickState,
  States,
  StatesTransition,
  useStateEffect,
} from "react-states";

import {
  CheckListItemDTO,
  DinnerDTO,
  FamilyDTO,
  GroceryDTO,
  TodoDTO,
  WeekDTO,
} from "../../environment-interface/storage";
import { useSession, User } from "../SessionFeature";
import { mod } from "../../utils";
import { getDay, isThisWeek } from "date-fns";
import {
  createReducer,
  useEnvironment,
  useReducer,
} from "../../environment-interface";

export type Family = FamilyDTO;

export type { User } from "../SessionFeature";

export type Dinner = DinnerDTO;

export type Grocery = GroceryDTO;

export type Groceries = {
  [groceryId: string]: Grocery;
};

export type Dinners = {
  [dinnerId: string]: Dinner;
};

export type Todo = TodoDTO;

export type CheckListItem = CheckListItemDTO;

export type CheckListItemsByTodoId = {
  [todoId: string]: {
    [itemId: string]: CheckListItem;
  };
};

export type ViewState =
  | {
      state: "WEEKDAYS";
    }
  | {
      state: "GROCERIES_SHOPPING";
    }
  | {
      state: "CHECKLISTS";
    }
  | {
      state: "PLAN_NEXT_WEEK_DINNERS";
    }
  | {
      state: "PLAN_NEXT_WEEK_TODOS";
    }
  | {
      state: "DINNERS";
    }
  | {
      state: "ADD_DINNER";
    }
  | {
      state: "ADD_TODO";
    };

export type Todos = {
  [todoId: string]: Todo;
};

export type Week = WeekDTO;

export type WeekdayTodos = {
  [todoId: string]: string[];
};

type State =
  | {
      state: "AWAITING_AUTHENTICATION";
    }
  | {
      state: "REQUIRING_AUTHENTICATION";
    }
  | {
      state: "LOADING";
      user: User;
      groceries?: Groceries;
      todos?: Todos;
      previousWeek?: Week;
      currentWeek?: Week;
      nextWeek?: Week;
      dinners?: Dinners;
      family?: Family;
      checkListItemsByTodoId?: CheckListItemsByTodoId;
    }
  | {
      state: "LOADED";
      family: Family;
      groceries: Groceries;
      todos: Todos;
      previousWeek: Week;
      currentWeek: Week;
      nextWeek: Week;
      view: ViewState;
      user: User;
      checkListItemsByTodoId: CheckListItemsByTodoId;
      dinners: Dinners;
    }
  | {
      state: "ERROR";
      error: string;
    };

export type Action =
  | {
      type: "VIEW_SELECTED";
      view: ViewState;
    }
  | {
      type: "GROCERY_INPUT_CHANGED";
      input: string;
    }
  | {
      type: "ADD_GROCERY";
      name: string;
    };

export type DashboardFeature = States<State, Action>;

type Transition = StatesTransition<DashboardFeature>;

const featureContext = createContext({} as DashboardFeature);

export const useFeature = () => useContext(featureContext);

const evaluateLoadedState = (
  state: PickState<DashboardFeature, "LOADING">
): State => {
  if (
    state.currentWeek &&
    state.nextWeek &&
    state.previousWeek &&
    state.groceries &&
    state.todos &&
    state.family &&
    state.checkListItemsByTodoId &&
    state.dinners
  ) {
    return {
      state: "LOADED",
      view: {
        state: "WEEKDAYS",
      },
      currentWeek: state.currentWeek,
      family: state.family,
      groceries: state.groceries,
      nextWeek: state.nextWeek,
      previousWeek: state.previousWeek,
      todos: state.todos,
      user: state.user,
      checkListItemsByTodoId: state.checkListItemsByTodoId,
      dinners: state.dinners,
    };
  }

  return state;
};

const reducer = createReducer<DashboardFeature>({
  AWAITING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }): Transition => ({
      state: "LOADING",
      user,
    }),
    "AUTHENTICATION:UNAUTHENTICATED": (): Transition => ({
      state: "REQUIRING_AUTHENTICATION",
    }),
  },
  REQUIRING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }): Transition => ({
      state: "LOADING",
      user,
    }),
  },
  LOADING: {
    "STORAGE:FAMILY_UPDATE": (state, { family }): Transition =>
      evaluateLoadedState({
        ...state,
        family,
      }),
    "STORAGE:WEEKS_UPDATE": (
      state,
      { previousWeek, currentWeek, nextWeek }
    ): Transition =>
      evaluateLoadedState({
        ...state,
        previousWeek,
        currentWeek,
        nextWeek,
      }),
    "STORAGE:GROCERIES_UPDATE": (state, { groceries }): Transition =>
      evaluateLoadedState({
        ...state,
        groceries,
      }),
    "STORAGE:TODOS_UPDATE": (state, { todos }): Transition =>
      evaluateLoadedState({
        ...state,
        todos,
      }),
    "STORAGE:CHECKLIST_ITEMS_UPDATE": (
      state,
      { checkListItemsByTodoId }
    ): Transition =>
      evaluateLoadedState({
        ...state,
        checkListItemsByTodoId,
      }),
    "STORAGE:DINNERS_UPDATE": (state, { dinners }): Transition =>
      evaluateLoadedState({
        ...state,
        dinners,
      }),
    "STORAGE:FETCH_WEEKS_ERROR": (_, { error }): Transition => ({
      state: "ERROR",
      error,
    }),
  },
  LOADED: {
    "STORAGE:FAMILY_UPDATE": (state, { family }): Transition => ({
      ...state,
      family,
    }),
    "STORAGE:GROCERIES_UPDATE": (state, { groceries }): Transition => ({
      ...state,
      groceries,
    }),
    "STORAGE:DINNERS_UPDATE": (state, { dinners }): Transition => ({
      ...state,
      dinners,
    }),
    "STORAGE:WEEKS_UPDATE": (
      state,
      { currentWeek, nextWeek, previousWeek }
    ): Transition => ({
      ...state,
      currentWeek,
      nextWeek,
      previousWeek,
    }),
    "STORAGE:TODOS_UPDATE": (state, { todos }): Transition => ({
      ...state,
      view:
        state.view.state === "ADD_TODO"
          ? {
              state: "WEEKDAYS",
            }
          : state.view,
      todos,
    }),
    "STORAGE:CHECKLIST_ITEMS_UPDATE": (
      state,
      { checkListItemsByTodoId }
    ): Transition => ({
      ...state,
      checkListItemsByTodoId,
    }),
    VIEW_SELECTED: (state, { view }): Transition => ({
      ...state,
      view,
    }),
  },
  ERROR: {},
});

export type Props = {
  children: React.ReactNode;
  initialState?: State;
};

export const selectors = {
  todosByWeekday: (week: Week) => {
    const todosByWeekday: [
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos
    ] = [{}, {}, {}, {}, {}, {}, {}];

    for (let todoId in week.todos) {
      for (let userId in week.todos[todoId]) {
        week.todos[todoId][userId].forEach((isActive, index) => {
          if (isActive) {
            if (!todosByWeekday[index][todoId]) {
              todosByWeekday[index][todoId] = [];
            }
            todosByWeekday[index][todoId].push(userId);
          }
        });
      }
    }

    return todosByWeekday;
  },
  eventsByWeekday: (todos: Todos) => {
    const eventsByWeekday: [
      Todo[],
      Todo[],
      Todo[],
      Todo[],
      Todo[],
      Todo[],
      Todo[]
    ] = [[], [], [], [], [], [], []];

    Object.values(todos).forEach((todo) => {
      if (
        todo.date &&
        isThisWeek(todo.date, {
          weekStartsOn: 1,
        })
      ) {
        eventsByWeekday[mod(getDay(todo.date) - 1, 7)].push(todo);
      }
    });

    return eventsByWeekday.map((weekDay) =>
      weekDay.sort((a, b) => {
        if (a.date! > b.date!) {
          return 1;
        }
        if (a.date! < b.date!) {
          return -1;
        }

        return 0;
      })
    );
  },
  sortedTodos: (todos: Todos) =>
    Object.values(todos).sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      } else if (a.created > b.created) {
        return -1;
      }

      return 0;
    }),
};

export const Feature = ({ children, initialState }: Props) => {
  const { storage, authentication } = useEnvironment();
  const [session] = useSession();

  initialState =
    initialState ||
    match(session, {
      VERIFYING_AUTHENTICATION: (): State => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      SIGNING_IN: (): State => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      ERROR: (): State => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      NO_FAMILY: (): State => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      JOINING_FAMILY: (): State => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      CREATING_FAMILY: (): State => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      SIGNED_IN: ({ user }): State => ({
        state: "LOADING",
        user,
      }),
      SIGNED_OUT: (): State => ({
        state: "REQUIRING_AUTHENTICATION",
      }),
      UPDATING_VERSION: (): State => ({
        state: "AWAITING_AUTHENTICATION",
      }),
    });

  const feature = useReducer("Dashboard", reducer, initialState);

  const [state] = feature;

  useStateEffect(state, "LOADING", ({ user }) => {
    storage.fetchFamilyData(user.familyId);
    storage.fetchWeeks(user.familyId, user.id);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
