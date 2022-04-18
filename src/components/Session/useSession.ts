import { StatesReducer, useStateEffect } from "react-states";
import {
  createReducer,
  useEnvironment,
  useReducer,
} from "../../environment-interface";

export type User = {
  id: string;
  familyId: string;
};

export type VersionState =
  | {
      state: "PENDING";
    }
  | {
      state: "RECENT";
      version: string;
    }
  | {
      state: "EXPIRED";
      version: string;
      newVersion: string;
    };

export type State =
  | {
      state: "VERIFYING_AUTHENTICATION";
    }
  | {
      state: "SIGNING_IN";
    }
  | {
      state: "NO_FAMILY";
    }
  | {
      state: "CREATING_FAMILY";
    }
  | {
      state: "JOINING_FAMILY";
    }
  | {
      state: "SIGNED_IN";
      user: User;
      version: VersionState;
    }
  | {
      state: "SIGNED_OUT";
    }
  | {
      state: "ERROR";
      error: string;
    }
  | {
      state: "UPDATING_VERSION";
    };

export type Action =
  | {
      type: "SIGN_IN";
    }
  | {
      type: "UPDATE";
    };

export type SessionReducer = StatesReducer<State, Action>;

const reducer = createReducer<SessionReducer>({
  VERIFYING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED": ({ transition }) =>
      transition({
        state: "NO_FAMILY",
      }),
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": ({
      action: { user },
      transition,
    }) =>
      transition({
        state: "SIGNED_IN",
        user,
        version: {
          state: "PENDING",
        },
      }),
    "AUTHENTICATION:UNAUTHENTICATED": ({ transition }) =>
      transition({
        state: "SIGNED_OUT",
      }),
    "AUTHENTICATION:ERROR": ({ action: { error }, transition }) =>
      transition({
        state: "ERROR",
        error,
      }),
  },
  SIGNING_IN: {
    "AUTHENTICATION:AUTHENTICATED": ({ action: { user }, transition }) =>
      transition({
        state: "NO_FAMILY",
      }),
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": ({
      action: { user },
      transition,
    }) =>
      transition({
        state: "SIGNED_IN",
        user,
        version: {
          state: "PENDING",
        },
      }),
    "AUTHENTICATION:SIGN_IN_ERROR": ({ action: { error }, transition }) =>
      transition({
        state: "ERROR",
        error,
      }),
  },
  SIGNED_IN: {
    "AUTHENTICATION:UNAUTHENTICATED": ({ transition }) =>
      transition({
        state: "SIGNED_OUT",
      }),
    "VERSION:NEW": ({ state, action: { newVersion, version }, transition }) =>
      transition({
        ...state,
        version: {
          state: "EXPIRED",
          newVersion,
          version,
        },
      }),
    "VISIBILITY:VISIBLE": ({ state, transition }) =>
      transition(state, {
        cmd: "$CALL_ENVIRONMENT",
        target: "version.checkVersion",
        params: [],
      }),
    UPDATE: ({ transition }) => transition({ state: "UPDATING_VERSION" }),
  },
  SIGNED_OUT: {
    SIGN_IN: ({ transition }) => transition({ state: "SIGNING_IN" }),
  },
  CREATING_FAMILY: {},
  JOINING_FAMILY: {},
  NO_FAMILY: {},
  ERROR: {},
  UPDATING_VERSION: {},
});

export const useSession = ({ initialState }: { initialState?: State }) => {
  const { authentication, version } = useEnvironment();
  const sessionReducer = useReducer(
    "Session",
    reducer,
    initialState || {
      state: "VERIFYING_AUTHENTICATION",
    }
  );

  const [state] = sessionReducer;

  useStateEffect(state, "SIGNING_IN", () => authentication.signIn());

  useStateEffect(state, "SIGNED_IN", () => version.checkVersion());

  useStateEffect(state, "UPDATING_VERSION", () => version.update());

  return sessionReducer;
};
