import { useGlobalContext } from "../useGlobalContext";
import { App } from "./App";
import { Skeleton } from "./DashboardContext/Skeleton";
import { SignInModal } from "./SignInModal";
import { useAppContext } from "./useAppContext";

import { Suspense } from "react";

export const AppContext: React.FC = () => {
  const { authentication } = useGlobalContext();

  if (authentication.state.status === "AUTHENTICATING") {
    return <Skeleton />;
  }

  if (authentication.state.status === "UNAUTHENTICATED") {
    return (
      <>
        <Skeleton />
        <SignInModal />
      </>
    );
  }

  return (
    <useAppContext.Provider
      key={authentication.state.user.id}
      user={authentication.state.user}
      family={authentication.state.family}
    >
      <Suspense fallback={<Skeleton />}>
        <App />
      </Suspense>
    </useAppContext.Provider>
  );
};
