import { Dispatch, useEffect, useReducer } from "react";
import {
  createActions,
  createStates,
  ActionsUnion,
  StatesUnion,
  transition,
  useDevtools,
  useEnter,
  useTransition,
} from "react-states";
import { EnvironmentEvent, useEnvironment } from "../../environment-interface";

export type User = {
  id: string;
  familyId: string;
};

export const actions = createActions({
  SIGN_IN: () => ({}),
  UPDATE: () => ({}),
});

export type Action = ActionsUnion<typeof actions>;

const versionStates = createStates({
  PENDING: () => ({}),
  RECENT: (version: string) => ({
    version,
  }),
  EXPIRED: ({
    newVersion,
    version,
  }: {
    version: string;
    newVersion: string;
  }) => ({
    version,
    newVersion,
  }),
});

export type VersionState = StatesUnion<typeof versionStates>;

const states = createStates({
  VERIFYING_AUTHENTICATION: () => ({}),
  SIGNING_IN: () => ({}),
  NO_FAMILY: () => ({}),
  CREATING_FAMILY: () => ({}),
  JOINING_FAMILY: () => ({}),
  SIGNED_IN: ({ user, version }: { user: User; version: VersionState }) => ({
    user,
    version,
  }),
  SIGNED_OUT: () => ({}),
  ERROR: (error: string) => ({
    error,
  }),
  UPDATING_VERSION: () => ({}),
});

export type State = StatesUnion<typeof states>;

export type SessionState = State;

export type SessionAction = Action;

const reducer = (prevState: State, action: Action | EnvironmentEvent) =>
  transition(prevState, action, {
    VERIFYING_AUTHENTICATION: {
      "AUTHENTICATION:AUTHENTICATED": () => states.NO_FAMILY(),
      "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }) =>
        states.SIGNED_IN({ user, version: versionStates.PENDING() }),
      "AUTHENTICATION:UNAUTHENTICATED": () => states.SIGNED_OUT(),
      "AUTHENTICATION:ERROR": (_, { error }) => states.ERROR(error),
    },
    SIGNING_IN: {
      "AUTHENTICATION:AUTHENTICATED": () => states.NO_FAMILY(),
      "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }) =>
        states.SIGNED_IN({ user, version: versionStates.PENDING() }),
      "AUTHENTICATION:SIGN_IN_ERROR": (_, { error }) => states.ERROR(error),
    },
    SIGNED_IN: {
      "AUTHENTICATION:UNAUTHENTICATED": () => states.SIGNED_OUT(),
      "VERSION:NEW": ({ user }, { newVersion, version }) =>
        states.SIGNED_IN({
          user,
          version: versionStates.EXPIRED({ version, newVersion }),
        }),
      "VISIBILITY:VISIBLE": (current) =>
        states.SIGNED_IN({ ...current, version: versionStates.PENDING() }),
      UPDATE: () => states.UPDATING_VERSION(),
    },
    SIGNED_OUT: {
      SIGN_IN: () => states.SIGNING_IN(),
    },
    CREATING_FAMILY: {},
    JOINING_FAMILY: {},
    NO_FAMILY: {},
    ERROR: {},
    UPDATING_VERSION: {},
  });

export const useSession = ({ initialState }: { initialState?: State }) => {
  const { authentication, version, subscribe } = useEnvironment();
  const sessionReducer = useReducer(
    reducer,
    initialState || states.VERIFYING_AUTHENTICATION()
  );

  useDevtools("Session", sessionReducer);

  const [state, dispatch] = sessionReducer;

  useEffect(() => subscribe(dispatch), []);

  useEnter(state, "SIGNING_IN", () => authentication.signIn());

  useEnter(state, "SIGNED_IN", () => version.checkVersion());

  useEnter(state, "UPDATING_VERSION", () => version.update());

  useTransition(state, "SIGNED_IN => VISIBILITY:VISIBLE => SIGNED_IN", () =>
    version.checkVersion()
  );

  return [state, actions(dispatch)] as const;
};
