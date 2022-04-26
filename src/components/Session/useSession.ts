import { useEffect, useReducer } from "react";
import {
  $COMMAND,
  IAction,
  ICommand,
  IState,
  pick,
  PickCommand,
  ReturnTypes,
  transition,
  TTransitions,
  useCommandEffect,
  useDevtools,
  useStateEffect,
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

export type Action = ReturnTypes<typeof actions, IAction>;

const commands = {
  CHECK_VERSION: () => ({
    cmd: "CHECK_VERSION" as const,
  }),
};

type Command = ReturnTypes<typeof commands, ICommand>;

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
    ...pick(actions, "UPDATE"),
  }),
};

export type VersionState = ReturnTypes<typeof versionStates, IState>;

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
  SIGNED_IN: (
    { user, version }: { user: User; version: VersionState },
    command?: PickCommand<Command, "CHECK_VERSION">
  ) => ({
    state: "SIGNED_IN" as const,
    user,
    version,
    [$COMMAND]: command,
  }),
  SIGNED_OUT: () => ({
    state: "SIGNED_OUT" as const,
    ...pick(actions, "SIGN_IN"),
  }),
  ERROR: (error: string) => ({
    state: "ERROR" as const,
    error,
  }),
  UPDATING_VERSION: () => ({
    state: "UPDATING_VERSION" as const,
  }),
};

export type State = ReturnTypes<typeof states, IState>;

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
    "VISIBILITY:VISIBLE": ({ user, version }) =>
      SIGNED_IN(
        {
          user,
          version,
        },
        commands.CHECK_VERSION()
      ),
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

const reducer = (state: State, action: Action) =>
  transition(state, action, transitions);

export const useSession = ({ initialState }: { initialState?: State }) => {
  const { authentication, version, emitter } = useEnvironment();
  const sessionReducer = useReducer(
    reducer,
    initialState || VERIFYING_AUTHENTICATION()
  );

  useDevtools("Session", sessionReducer);

  const [state, dispatch] = sessionReducer;

  useEffect(() => emitter.subscribe(dispatch));

  useStateEffect(state, "SIGNING_IN", () => authentication.signIn());

  useStateEffect(state, "SIGNED_IN", () => version.checkVersion());

  useStateEffect(state, "UPDATING_VERSION", () => version.update());

  useCommandEffect(state, "CHECK_VERSION", () => version.checkVersion());

  return sessionReducer;
};
