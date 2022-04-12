import { StatesReducer, StatesTransition } from "react-states";
import { createReducer } from "../../environment-interface";

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

type Command = {
  cmd: "CHECK_VERSION";
};

export type SessionReducer = StatesReducer<State, Action, Command>;

type Transition = StatesTransition<SessionReducer>;

export const reducer = createReducer<SessionReducer>({
  VERIFYING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED": (_, { user }): Transition => ({
      state: "NO_FAMILY",
    }),
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }): Transition => ({
      state: "SIGNED_IN",
      user,
      version: {
        state: "PENDING",
      },
    }),
    "AUTHENTICATION:UNAUTHENTICATED": (): Transition => ({
      state: "SIGNED_OUT",
    }),
    "AUTHENTICATION:ERROR": (_, { error }): Transition => ({
      state: "ERROR",
      error,
    }),
  },
  SIGNING_IN: {
    "AUTHENTICATION:AUTHENTICATED": (_, { user }): Transition => ({
      state: "NO_FAMILY",
    }),
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": (_, { user }): Transition => ({
      state: "SIGNED_IN",
      user,
      version: {
        state: "PENDING",
      },
    }),
    "AUTHENTICATION:SIGN_IN_ERROR": (_, { error }): Transition => ({
      state: "ERROR",
      error,
    }),
  },
  SIGNED_IN: {
    "AUTHENTICATION:UNAUTHENTICATED": (): Transition => ({
      state: "SIGNED_OUT",
    }),
    "VERSION:NEW": (state, { newVersion, version }): Transition => ({
      ...state,
      version: {
        state: "EXPIRED",
        newVersion,
        version,
      },
    }),
    "VISIBILITY:VISIBLE": (state): Transition => [
      state,
      {
        cmd: "CHECK_VERSION",
      },
    ],
    UPDATE: (): Transition => ({ state: "UPDATING_VERSION" }),
  },
  SIGNED_OUT: {
    SIGN_IN: (): Transition => ({ state: "SIGNING_IN" }),
  },
  CREATING_FAMILY: {},
  JOINING_FAMILY: {},
  NO_FAMILY: {},
  ERROR: {},
  UPDATING_VERSION: {},
});
