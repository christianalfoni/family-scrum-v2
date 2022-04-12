import { createContext, useContext } from "react";
import { useCommandEffect, useStateEffect } from "react-states";
import { useEnvironment, useReducer } from "../../environment-interface";
import { reducer, SessionReducer } from "./reducer";
import { SignInModal } from "./SignInModal";
import { UpdateModal } from "./UpdateModal";

const context = createContext({} as SessionReducer);

export const useSession = () => useContext(context);

export const Session: React.FC = ({ children }) => {
  const { authentication, version } = useEnvironment();
  const sessionReducer = useReducer("Session", reducer, {
    state: "VERIFYING_AUTHENTICATION",
  });

  const [state] = sessionReducer;

  useStateEffect(state, "SIGNING_IN", () => authentication.signIn());

  useCommandEffect(state, "CHECK_VERSION", () => version.checkVersion());

  useStateEffect(state, "SIGNED_IN", () => version.checkVersion());

  useStateEffect(state, "UPDATING_VERSION", () => version.update());

  return (
    <context.Provider value={sessionReducer}>
      {children}
      <SignInModal session={sessionReducer} />
      <UpdateModal session={sessionReducer} />
    </context.Provider>
  );
};
