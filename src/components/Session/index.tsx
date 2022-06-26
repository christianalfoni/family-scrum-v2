import { createContext, Dispatch, useContext } from "react";

import {
  SessionState,
  actions,
  useSession as useSessionReducer,
} from "./useSession";
import { SignInModal } from "./SignInModal";
import { UpdateModal } from "./UpdateModal";

const context = createContext(
  [] as unknown as readonly [SessionState, ReturnType<typeof actions>]
);

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
