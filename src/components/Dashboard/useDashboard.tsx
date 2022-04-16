import { match, PickState, StatesReducer, useStateEffect } from "react-states";

import {
  CheckListItemsByTodoId,
  DinnerDTO,
  FamilyDTO,
  GroceryDTO,
  TodoDTO,
  WeekDTO,
} from "../../environment-interface/storage";

import {
  createReducer,
  useEnvironment,
  useReducer,
} from "../../environment-interface";
import { FamilyUserDTO } from "../../environment-interface/authentication";
import { useSession } from "../Session";

export type ViewState =
  | {
      state: "DASHBOARD";
    }
  | {
      state: "GROCERIES_SHOPPING";
    }
  | {
      state: "CHECKLISTS";
    }
  | {
      state: "PLAN_NEXT_WEEK";
      subView: "DINNERS" | "TODOS";
    }
  | {
      state: "DINNERS";
    }
  | {
      state: "EDIT_DINNER";
      id?: string;
    }
  | {
      state: "EDIT_TODO";
      id?: string;
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
      user: FamilyUserDTO;
      groceries?: Record<string, GroceryDTO>;
      todos?: Record<string, TodoDTO>;
      previousWeek?: WeekDTO;
      currentWeek?: WeekDTO;
      nextWeek?: WeekDTO;
      dinners?: Record<string, DinnerDTO>;
      family?: FamilyDTO;
      checkListItemsByTodoId?: CheckListItemsByTodoId;
    }
  | {
      state: "LOADED";
      family: FamilyDTO;
      groceries: Record<string, GroceryDTO>;
      todos: Record<string, TodoDTO>;
      previousWeek: WeekDTO;
      currentWeek: WeekDTO;
      nextWeek: WeekDTO;
      user: FamilyUserDTO;
      checkListItemsByTodoId: CheckListItemsByTodoId;
      dinners: Record<string, DinnerDTO>;
      viewStack: ViewState[];
    }
  | {
      state: "ERROR";
      error: string;
    };

export type Action =
  | {
      type: "PUSH_VIEW";
      view: ViewState;
    }
  | {
      type: "POP_VIEW";
    }
  | {
      type: "REPLACE_VIEW";
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

export type DashboardReducer = StatesReducer<State, Action>;

const isSameView = (viewA: any, viewB: any) => {
  const viewAKeys = Object.keys(viewA);
  const viewBKeys = Object.keys(viewB);

  return (
    viewAKeys.length === viewBKeys.length &&
    viewAKeys.reduce<boolean>((aggr, key) => {
      return aggr ? viewB[key] === viewA[key] : false;
    }, true)
  );
};

const evaluateLoadedState = (
  state: PickState<DashboardReducer, "LOADING">
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
      viewStack: [
        {
          state: "DASHBOARD",
        },
      ],

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

const reducer = createReducer<DashboardReducer>({
  AWAITING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": ({
      action: { user },
      transition,
    }) =>
      transition({
        state: "LOADING",
        user,
      }),
    "AUTHENTICATION:UNAUTHENTICATED": ({ transition }) =>
      transition({
        state: "REQUIRING_AUTHENTICATION",
      }),
  },
  REQUIRING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": ({
      action: { user },
      transition,
    }) =>
      transition({
        state: "LOADING",
        user,
      }),
  },
  LOADING: {
    "STORAGE:FAMILY_UPDATE": ({ state, action: { family }, transition }) =>
      transition(
        evaluateLoadedState({
          ...state,
          family,
        })
      ),
    "STORAGE:WEEKS_UPDATE": ({
      state,
      action: { previousWeek, currentWeek, nextWeek },
      transition,
    }) =>
      transition(
        evaluateLoadedState({
          ...state,
          previousWeek,
          currentWeek,
          nextWeek,
        })
      ),
    "STORAGE:GROCERIES_UPDATE": ({
      state,
      action: { groceries },
      transition,
    }) =>
      transition(
        evaluateLoadedState({
          ...state,
          groceries,
        })
      ),
    "STORAGE:TODOS_UPDATE": ({ state, action: { todos }, transition }) =>
      transition(
        evaluateLoadedState({
          ...state,
          todos,
        })
      ),
    "STORAGE:CHECKLIST_ITEMS_UPDATE": ({
      state,
      action: { checkListItemsByTodoId },
      transition,
    }) =>
      transition(
        evaluateLoadedState({
          ...state,
          checkListItemsByTodoId,
        })
      ),
    "STORAGE:DINNERS_UPDATE": ({ state, action: { dinners }, transition }) =>
      transition(
        evaluateLoadedState({
          ...state,
          dinners,
        })
      ),
    "STORAGE:FETCH_WEEKS_ERROR": ({ action: { error }, transition }) =>
      transition({
        state: "ERROR",
        error,
      }),
  },
  LOADED: {
    "STORAGE:FAMILY_UPDATE": ({ state, action: { family }, transition }) =>
      transition({
        ...state,
        family,
      }),
    "STORAGE:GROCERIES_UPDATE": ({
      state,
      action: { groceries },
      transition,
    }) =>
      transition({
        ...state,
        groceries,
      }),
    "STORAGE:DINNERS_UPDATE": ({ state, action: { dinners }, transition }) =>
      transition({
        ...state,
        dinners,
      }),
    "STORAGE:WEEKS_UPDATE": ({
      state,
      action: { currentWeek, nextWeek, previousWeek },
      transition,
    }) =>
      transition({
        ...state,
        currentWeek,
        nextWeek,
        previousWeek,
      }),
    "STORAGE:TODOS_UPDATE": ({ state, action: { todos }, transition }) =>
      transition({
        ...state,
        todos,
      }),
    "STORAGE:CHECKLIST_ITEMS_UPDATE": ({
      state,
      action: { checkListItemsByTodoId },
      transition,
    }) =>
      transition({
        ...state,
        checkListItemsByTodoId,
      }),
    PUSH_VIEW: ({ state, action: { view }, transition, noop }) => {
      const currentView = state.viewStack[state.viewStack.length - 1];

      return isSameView(view, currentView)
        ? noop()
        : transition({
            ...state,
            viewStack: state.viewStack.concat(view),
          });
    },
    REPLACE_VIEW: ({ state, transition, action: { view } }) =>
      transition({
        ...state,
        viewStack: [
          ...state.viewStack.slice(0, state.viewStack.length - 1),
          view,
        ],
      }),
    POP_VIEW: ({ state, transition }) =>
      transition({
        ...state,
        viewStack: state.viewStack.slice(0, state.viewStack.length - 1),
      }),
  },
  ERROR: {},
});

export type Props = {
  initialState?: State;
};

export const useDashboard = ({ initialState }: Props) => {
  const { storage } = useEnvironment();
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

  const dashboardReducer = useReducer("Dashboard", reducer, initialState);

  const [state] = dashboardReducer;

  useStateEffect(state, "LOADING", ({ user }) => {
    storage.configureFamilyCollection(user.familyId);
    storage.fetchFamilyData();
    storage.fetchWeeks(user.id);
  });

  return dashboardReducer;
};
