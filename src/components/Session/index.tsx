import { createContext, useContext } from "react";
import { useEnvironment } from "../../environment-interface";
import { SessionReducer, useSession as useSessionReducer } from "./useSession";
import { SignInModal } from "./SignInModal";
import { UpdateModal } from "./UpdateModal";

const context = createContext({} as SessionReducer);

export const useSession = () => useContext(context);

export const Session: React.FC = ({ children }) => {
  const { authentication, version } = useEnvironment();
  const sessionReducer = useSessionReducer({});

  return (
    <context.Provider value={sessionReducer}>
      {children}
      <SignInModal session={sessionReducer} />
      <UpdateModal session={sessionReducer} />
    </context.Provider>
  );
};
