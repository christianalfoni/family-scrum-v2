import { createContext, Dispatch, useContext } from "react";

import {
  SessionAction,
  SessionState,
  useSession as useSessionReducer,
} from "./useSession";
import { SignInModal } from "./SignInModal";
import { UpdateModal } from "./UpdateModal";

const context = createContext({} as [SessionState, Dispatch<SessionAction>]);

export const useSession = () => useContext(context);

export const Session: React.FC = ({ children }) => {
  const sessionReducer = useSessionReducer({});

  return (
    <context.Provider value={sessionReducer}>
      {children}
      <SignInModal />
      <UpdateModal />
    </context.Provider>
  );
};
