import { Dispatch, useEffect, useReducer } from "react";
import {
  transition,
  TTransitions,
  useDevtools,
  useTransitionEffect,
} from "react-states";
import { EnvironmentEvent, useEnvironment } from "../../environment-interface";

export type User = {
  id: string;
  familyId: string;
};

const actions = {
  SIGN_IN: () => ({
    type: "SIGN_IN" as const,
  }),
  UPDATE: () => ({
    type: "UPDATE" as const,
  }),
};

export type Action = ReturnType<typeof actions[keyof typeof actions]>;

const versionStates = {
  PENDING: () => ({
    state: "PENDING" as const,
  }),
  RECENT: (version: string) => ({
    state: "RECENT" as const,
    version,
  }),
  EXPIRED: ({
    newVersion,
    version,
  }: {
    version: string;
    newVersion: string;
  }) => ({
    state: "EXPIRED" as const,
    version,
    newVersion,
    UPDATE: actions.UPDATE,
  }),
};

export type VersionState = ReturnType<
  typeof versionStates[keyof typeof versionStates]
>;

const states = {
  VERIFYING_AUTHENTICATION: () => ({
    state: "VERIFYING_AUTHENTICATION" as const,
  }),
  SIGNING_IN: () => ({
    state: "SIGNING_IN" as const,
  }),
  NO_FAMILY: () => ({
    state: "NO_FAMILY" as const,
  }),
  CREATING_FAMILY: () => ({
    state: "CREATING_FAMILY" as const,
  }),
  JOINING_FAMILY: () => ({
    state: "JOINING_FAMILY" as const,
  }),
  SIGNED_IN: ({ user, version }: { user: User; version: VersionState }) => ({
    state: "SIGNED_IN" as const,
    user,
    version,
  }),
  SIGNED_OUT: () => ({
    state: "SIGNED_OUT" as const,
    SIGN_IN: actions.SIGN_IN,
  }),
  ERROR: (error: string) => ({
    state: "ERROR" as const,
    error,
  }),
  UPDATING_VERSION: () => ({
    state: "UPDATING_VERSION" as const,
  }),
};

export type State = ReturnType<typeof states[keyof typeof states]>;

export type SessionState = State;

export type SessionAction = Action;

export const {
  CREATING_FAMILY,
  ERROR,
  JOINING_FAMILY,
  NO_FAMILY,
  SIGNED_IN,
  SIGNED_OUT,
  SIGNING_IN,
  UPDATING_VERSION,
  VERIFYING_AUTHENTICATION,
} = states;

const transitions: TTransitions<State, Action | EnvironmentEvent> = {
  VERIFYING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED": () => NO_FAMILY(),
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }) =>
      SIGNED_IN({ user, version: versionStates.PENDING() }),
    "AUTHENTICATION:UNAUTHENTICATED": () => SIGNED_OUT(),
    "AUTHENTICATION:ERROR": (_, { error }) => ERROR(error),
  },
  SIGNING_IN: {
    "AUTHENTICATION:AUTHENTICATED": (_, { user }) => NO_FAMILY(),
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }) =>
      SIGNED_IN({ user, version: versionStates.PENDING() }),
    "AUTHENTICATION:SIGN_IN_ERROR": (_, { error }) => ERROR(error),
  },
  SIGNED_IN: {
    "AUTHENTICATION:UNAUTHENTICATED": () => SIGNED_OUT(),
    "VERSION:NEW": ({ user }, { newVersion, version }) =>
      SIGNED_IN({
        user,
        version: versionStates.EXPIRED({ version, newVersion }),
      }),
    "VISIBILITY:VISIBLE": (state) =>
      SIGNED_IN({ ...state, version: versionStates.PENDING() }),
    UPDATE: () => UPDATING_VERSION(),
  },
  SIGNED_OUT: {
    SIGN_IN: () => SIGNING_IN(),
  },
  CREATING_FAMILY: {},
  JOINING_FAMILY: {},
  NO_FAMILY: {},
  ERROR: {},
  UPDATING_VERSION: {},
};

const reducer = (state: State, action: Action | EnvironmentEvent) =>
  transition(state, action, transitions);

export const useSession = ({
  initialState,
}: {
  initialState?: State;
}): [State, Dispatch<Action>] => {
  const { authentication, version, subscribe } = useEnvironment();
  const sessionReducer = useReducer(
    reducer,
    initialState || VERIFYING_AUTHENTICATION()
  );

  useDevtools("Session", sessionReducer);

  const [state, dispatch] = sessionReducer;

  useEffect(() => subscribe(dispatch));

  useTransitionEffect(state, "SIGNING_IN", () => authentication.signIn());

  useTransitionEffect(state, "SIGNED_IN", () => version.checkVersion());

  useTransitionEffect(state, "UPDATING_VERSION", () => version.update());

  useTransitionEffect(state, "SIGNED_IN", "VISIBILITY:VISIBLE", () =>
    version.checkVersion()
  );

  return sessionReducer;
};
