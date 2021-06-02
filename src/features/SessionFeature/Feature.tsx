import { useReducer } from "react";
import {
  createContext,
  useEvents,
  createHook,
  createReducer,
  useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { AuthenticationEvent } from "../../environment/authentication";
import { VersionEvent } from "../../environment/version";
import { VisibilityEvent } from "../../environment/visibility";

export type User = {
  id: string;
  familyId: string;
};

export type VersionContext =
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

export type Context =
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
      version: VersionContext;
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

type TransientContext = {
  state: "CHECKING_VERSION";
};

export type UIEvent =
  | {
      type: "SIGN_IN";
    }
  | {
      type: "UPDATE";
    };

export type Event =
  | UIEvent
  | AuthenticationEvent
  | VersionEvent
  | VisibilityEvent;

const context = createContext<Context, UIEvent, TransientContext>();

export const useFeature = createHook(context);

const reducer = createReducer<Context, Event, TransientContext>(
  {
    VERIFYING_AUTHENTICATION: {
      "AUTHENTICATION:AUTHENTICATED": ({ user }) => ({
        state: "NO_FAMILY",
      }),
      "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": ({ user }) => ({
        state: "SIGNED_IN",
        user,
        version: {
          state: "PENDING",
        },
      }),
      "AUTHENTICATION:UNAUTHENTICATED": () => ({ state: "SIGNED_OUT" }),
      "AUTHENTICATION:ERROR": ({ error }) => ({
        state: "ERROR",
        error,
      }),
    },
    SIGNING_IN: {
      "AUTHENTICATION:AUTHENTICATED": ({ user }) => ({
        state: "NO_FAMILY",
      }),
      "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": ({ user }) => ({
        state: "SIGNED_IN",
        user,
        version: {
          state: "PENDING",
        },
      }),
      "AUTHENTICATION:SIGN_IN_ERROR": ({ error }): Context => ({
        state: "ERROR",
        error,
      }),
    },
    SIGNED_IN: {
      "AUTHENTICATION:UNAUTHENTICATED": () => ({ state: "SIGNED_OUT" }),
      "VERSION:NEW": ({ newVersion, version }, context) => ({
        ...context,
        version: {
          state: "EXPIRED",
          newVersion,
          version,
        },
      }),
      "VISIBILITY:VISIBLE": () => ({
        state: "CHECKING_VERSION",
      }),
    },
    SIGNED_OUT: {
      SIGN_IN: () => ({ state: "SIGNING_IN" }),
    },
    CREATING_FAMILY: {},
    JOINING_FAMILY: {},
    NO_FAMILY: {},
    ERROR: {},
    UPDATING_VERSION: {},
  },
  {
    CHECKING_VERSION: (_, prevContext) => prevContext,
  }
);

export type Props = {
  children: React.ReactNode;
  initialContext?: Context;
};

export const Feature = ({
  children,
  initialContext = {
    state: "VERIFYING_AUTHENTICATION",
  },
}: Props) => {
  const { authentication, version, visibility } = useEnvironment();
  const featureReducer = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("Session", featureReducer);
  }

  const [feature, send] = featureReducer;

  useEvents(authentication.events, send);
  useEvents(version.events, send);
  useEvents(visibility.events, send);

  useEnterEffect(feature, "SIGNING_IN", () => authentication.signIn());

  useEnterEffect(feature, "CHECKING_VERSION", () => version.checkVersion());

  useEnterEffect(feature, "UPDATING_VERSION", () => version.update());

  return <context.Provider value={featureReducer}>{children}</context.Provider>;
};
