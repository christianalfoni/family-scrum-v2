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
import { AuthenticationEvent, UserDTO } from "../../environment/authentication";

export type User = UserDTO;

export type Context =
  | {
      state: "VERIFYING_AUTHENTICATION";
    }
  | {
      state: "SIGNING_IN";
    }
  | {
      state: "SIGNED_IN";
      user: User;
    }
  | {
      state: "SIGNED_OUT";
    }
  | {
      state: "ERROR";
      error: string;
    };

export type UIEvent = {
  type: "SIGN_IN";
};

export type Event = UIEvent | AuthenticationEvent;

const context = createContext<Context, UIEvent>();

export const useFeature = createHook(context);

const reducer = createReducer<Context, Event>({
  VERIFYING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED": ({ user }): Context => ({
      state: "SIGNED_IN",
      user,
    }),
    "AUTHENTICATION:UNAUTHENTICATED": () => ({ state: "SIGNED_OUT" }),
  },
  SIGNING_IN: {
    "AUTHENTICATION:AUTHENTICATED": ({ user }): Context => ({
      state: "SIGNED_IN",
      user,
    }),
    "AUTHENTICATION:SIGN_IN_ERROR": ({ error }): Context => ({
      state: "ERROR",
      error,
    }),
  },
  SIGNED_IN: {
    "AUTHENTICATION:UNAUTHENTICATED": () => ({ state: "SIGNED_OUT" }),
  },
  SIGNED_OUT: {
    SIGN_IN: () => ({ state: "SIGNING_IN" }),
  },
  ERROR: {},
});

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
  const { authentication } = useEnvironment();
  const featureReducer = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("Session", featureReducer);
  }

  const [feature, send] = featureReducer;

  useEvents(authentication.events, send);

  useEnterEffect(feature, "SIGNING_IN", () => authentication.signIn());

  return <context.Provider value={featureReducer}>{children}</context.Provider>;
};
