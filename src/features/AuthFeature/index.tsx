import { useEffect, useReducer } from "react";
import {
  createStatesContext,
  createStatesHook,
  createStatesReducer,
  exec,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { UserDTO } from "../../environment/auth";

export type User = UserDTO;

export type AuthContext =
  | {
      state: "VERIFYING_AUTHENTICATION";
    }
  | {
      state: "SIGNING_IN";
    }
  | {
      state: "AUTHENTICATED";
      user: User;
    }
  | {
      state: "UNAUTHENTICATED";
    }
  | {
      state: "ERROR";
      error: string;
    };

const SIGN_IN_SUCCESS = Symbol("SIGN_IN_SUCCESS");
const SIGN_IN_ERROR = Symbol("SIGN_IN_ERROR");
const AUTHENTICATION_EXISTS = Symbol("AUTHENTICATION_EXISTS");
const AUTHENTICATION_MISSING = Symbol("AUTHENTICATION_MISSING");
const AUTHENTICATION_ERROR = Symbol("AUTHENTICATION_ERROR");

export type AuthEvent =
  | {
      type: "SIGN_IN_REQUESTED";
    }
  | {
      type: typeof SIGN_IN_SUCCESS;
      user: UserDTO;
    }
  | {
      type: typeof SIGN_IN_ERROR;
      error: string;
    }
  | {
      type: typeof AUTHENTICATION_EXISTS;
      user: UserDTO;
    }
  | {
      type: typeof AUTHENTICATION_MISSING;
    }
  | {
      type: typeof AUTHENTICATION_ERROR;
      error: string;
    };

const authContext = createStatesContext<AuthContext, AuthEvent>();

export const useAuth = createStatesHook(authContext);

const authReducer = createStatesReducer<AuthContext, AuthEvent>({
  VERIFYING_AUTHENTICATION: {
    [AUTHENTICATION_EXISTS]: ({ user }) => ({ state: "AUTHENTICATED", user }),
    [AUTHENTICATION_MISSING]: () => ({ state: "UNAUTHENTICATED" }),
    [AUTHENTICATION_ERROR]: ({ error }) => ({ state: "ERROR", error }),
  },
  SIGNING_IN: {
    [SIGN_IN_SUCCESS]: ({ user }) => ({ state: "AUTHENTICATED", user }),
    [SIGN_IN_ERROR]: ({ error }) => ({ state: "ERROR", error }),
  },
  UNAUTHENTICATED: {
    SIGN_IN_REQUESTED: () => ({ state: "SIGNING_IN" }),
  },
  AUTHENTICATED: {},
  ERROR: {},
});

export type Props = {
  children: React.ReactNode;
  initialContext?: AuthContext;
};

export const AuthFeature = ({
  children,
  initialContext = {
    state: "VERIFYING_AUTHENTICATION",
  },
}: Props) => {
  const { auth } = useEnvironment();
  const authStates = useReducer(authReducer, initialContext);
  const [context, send] = authStates;

  if (process.browser) {
    useDevtools("Auth", authStates);
  }

  useEffect(
    () =>
      exec(context, {
        VERIFYING_AUTHENTICATION: () =>
          auth
            .authenticate()
            .resolve((user) => send({ type: AUTHENTICATION_EXISTS, user }), {
              NOT_AUTHENTICATED: () => send({ type: AUTHENTICATION_MISSING }),
              ERROR: (error) => send({ type: AUTHENTICATION_ERROR, error }),
            }),
        SIGNING_IN: () =>
          auth
            .signIn()
            .resolve((user) => send({ type: SIGN_IN_SUCCESS, user }), {
              NOT_AUTHENTICATED: () =>
                send({
                  type: SIGN_IN_ERROR,
                  error: "We could not authenticate you",
                }),
              ERROR: (error) => send({ type: AUTHENTICATION_ERROR, error }),
            }),
      }),
    [context]
  );

  return (
    <authContext.Provider value={authStates}>{children}</authContext.Provider>
  );
};
