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
import { Dispatch, useEffect, useReducer } from "react";
import {
  ERROR,
  LOADING,
  REQUIRING_AUTHENTICATION,
  LOADED,
  State,
  AWAITING_AUTHENTICATION,
} from "./state";
import { evaluateLoadedState, isSameView, updatedLoadedData } from "./utils";
import { Action } from "./actions";

export { viewStates } from "./state";
export type { Action as DashboardAction } from "./actions";
export type { ViewState, State as DashboardState } from "./state";

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

const reducer = (state: State, action: Action | EnvironmentEvent) =>
  transition(state, action, transitions);

export type Props = {
  initialState?: State;
};

export const useDashboard = ({
  initialState,
}: Props): [State, Dispatch<Action>] => {
  const { storage, subscribe } = useEnvironment();
  const [session] = useSession();

  initialState =
    initialState ||
    match(
      session,
      {
        SIGNED_OUT: () => REQUIRING_AUTHENTICATION(),
        SIGNED_IN: ({ user }) => LOADING({ user, data: {} }),
      },
      () => AWAITING_AUTHENTICATION()
    );

  const dashboardReducer = useReducer(reducer, initialState);

  useDevtools("Dashboard", dashboardReducer);

  const [state, dispatch] = dashboardReducer;

  useEffect(() => subscribe(dispatch));

  useStateEffect(state, "LOADING", ({ user }) => {
    storage.configureFamilyCollection(user.familyId);
    storage.fetchFamilyData();
    storage.fetchWeeks(user.id);
  });

  return dashboardReducer;
};
