import {
  match,
  transition,
  TTransitions,
  useDevtools,
  useStateEffect,
} from "react-states";

import {
  EnvironmentEvent,
  useEnvironment,
} from "../../../environment-interface";
import { useSession } from "../../Session";
import { useReducer } from "react";
import {
  Action,
  ERROR,
  LOADING,
  REQUIRING_AUTHENTICATION,
  LOADED,
  State,
  AWAITING_AUTHENTICATION,
} from "./creators";
import { evaluateLoadedState, isSameView, updatedLoadedData } from "./utils";

export { viewStates } from "./creators";
export type {
  ViewState,
  State as DashboardState,
  Action as DashboardAction,
} from "./creators";

const transitions: TTransitions<State, Action | EnvironmentEvent> = {
  AWAITING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }) =>
      LOADING({ user, data: {} }),
    "AUTHENTICATION:UNAUTHENTICATED": () => REQUIRING_AUTHENTICATION(),
  },
  REQUIRING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }) =>
      LOADING({ user, data: {} }),
  },
  LOADING: {
    "STORAGE:FAMILY_UPDATE": (state, newData) =>
      evaluateLoadedState(state, newData),
    "STORAGE:WEEKS_UPDATE": (state, newData) =>
      evaluateLoadedState(state, newData),
    "STORAGE:GROCERIES_UPDATE": (state, newData) =>
      evaluateLoadedState(state, newData),
    "STORAGE:TODOS_UPDATE": (state, newData) =>
      evaluateLoadedState(state, newData),
    "STORAGE:CHECKLIST_ITEMS_UPDATE": (state, newData) =>
      evaluateLoadedState(state, newData),
    "STORAGE:DINNERS_UPDATE": (state, newData) =>
      evaluateLoadedState(state, newData),
    "STORAGE:FETCH_WEEKS_ERROR": (_, { error }) => ERROR({ error }),
  },
  LOADED: {
    "STORAGE:FAMILY_UPDATE": (state, newData) =>
      updatedLoadedData(state, newData),
    "STORAGE:GROCERIES_UPDATE": (state, newData) =>
      updatedLoadedData(state, newData),
    "STORAGE:DINNERS_UPDATE": (state, newData) =>
      updatedLoadedData(state, newData),
    "STORAGE:WEEKS_UPDATE": (state, newData) =>
      updatedLoadedData(state, newData),
    "STORAGE:TODOS_UPDATE": (state, newData) =>
      updatedLoadedData(state, newData),
    "STORAGE:CHECKLIST_ITEMS_UPDATE": (state, newData) =>
      updatedLoadedData(state, newData),
    PUSH_VIEW: (state, { view }) => {
      const currentView = state.viewStack[state.viewStack.length - 1];

      return isSameView(view, currentView)
        ? state
        : LOADED({
            ...state,
            viewStack: state.viewStack.concat(view),
          });
    },
    REPLACE_VIEW: (state, { view }) =>
      LOADED({
        ...state,
        viewStack: [
          ...state.viewStack.slice(0, state.viewStack.length - 1),
          view,
        ],
      }),
    POP_VIEW: (state) =>
      LOADED({
        ...state,
        viewStack: state.viewStack.slice(0, state.viewStack.length - 1),
      }),
  },
  ERROR: {},
};

const reducer = (state: State, action: Action) =>
  transition(state, action, transitions);

export type Props = {
  initialState?: State;
};

export const useDashboard = ({ initialState }: Props) => {
  const { storage } = useEnvironment();
  const [session] = useSession();

  initialState =
    initialState ||
    match(session, {
      VERIFYING_AUTHENTICATION: () => AWAITING_AUTHENTICATION(),
      SIGNING_IN: () => AWAITING_AUTHENTICATION(),
      ERROR: () => AWAITING_AUTHENTICATION(),
      NO_FAMILY: () => AWAITING_AUTHENTICATION(),
      JOINING_FAMILY: () => AWAITING_AUTHENTICATION(),
      CREATING_FAMILY: () => AWAITING_AUTHENTICATION(),
      UPDATING_VERSION: () => AWAITING_AUTHENTICATION(),
      SIGNED_OUT: () => REQUIRING_AUTHENTICATION(),
      SIGNED_IN: ({ user }) => LOADING({ user, data: {} }),
    });

  const dashboardReducer = useReducer(reducer, initialState);

  useDevtools("Dashboard", dashboardReducer);

  const [state] = dashboardReducer;

  useStateEffect(state, "LOADING", ({ user }) => {
    storage.configureFamilyCollection(user.familyId);
    storage.fetchFamilyData();
    storage.fetchWeeks(user.id);
  });

  return dashboardReducer;
};
