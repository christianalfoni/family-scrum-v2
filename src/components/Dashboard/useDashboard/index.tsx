import { match, transition, useDevtools, useEnter } from "react-states";
import {
  EnvironmentEvent,
  useEnvironment,
} from "../../../environment-interface";
import { useSession } from "../../Session";
import { Dispatch, useEffect, useReducer } from "react";
import { State, states } from "./state";
import { evaluateLoadedState, isSameView, updatedLoadedData } from "./utils";
import { Action, actions } from "./actions";

export { viewStates } from "./state";
export type { Action as DashboardAction } from "./actions";
export type { ViewState, State as DashboardState } from "./state";

const reducer = (prevState: State, action: Action | EnvironmentEvent) =>
  transition(prevState, action, {
    AWAITING_AUTHENTICATION: {
      "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }) =>
        states.LOADING({ user, data: {} }),
      "AUTHENTICATION:UNAUTHENTICATED": () => states.REQUIRING_AUTHENTICATION(),
    },
    REQUIRING_AUTHENTICATION: {
      "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }) =>
        states.LOADING({ user, data: {} }),
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
      "STORAGE:FETCH_WEEKS_ERROR": (_, { error }) => states.ERROR({ error }),
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
      PUSH_VIEW: (state, { view }) =>
        isSameView(view, state.viewStack[state.viewStack.length - 1])
          ? state
          : states.LOADED({
              ...state,
              viewStack: state.viewStack.concat(view),
            }),
      REPLACE_VIEW: (state, { view }) =>
        states.LOADED({
          ...state,
          viewStack: [
            ...state.viewStack.slice(0, state.viewStack.length - 1),
            view,
          ],
        }),
      POP_VIEW: (state) =>
        states.LOADED({
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
  const { storage, subscribe } = useEnvironment();
  const [session] = useSession();

  const dashboardReducer = useReducer(
    reducer,
    initialState ||
      match(
        session,
        {
          SIGNED_OUT: () => states.REQUIRING_AUTHENTICATION(),
          SIGNED_IN: ({ user }) => states.LOADING({ user, data: {} }),
        },
        () => states.AWAITING_AUTHENTICATION()
      )
  );

  useDevtools("Dashboard", dashboardReducer);

  const [state, dispatch] = dashboardReducer;

  useEffect(() => subscribe(dispatch), []);

  useEnter(state, "LOADING", ({ user }) => {
    storage.configureFamilyCollection(user.familyId);
    storage.fetchFamilyData();
    storage.fetchWeeks(user.id);
  });

  return [state, actions(dispatch)] as const;
};
