import { useGlobalStore } from "@/stores/GlobalStore";
import { useAppStore } from "@/stores/AppStore";
import { App } from "./App";
import { Skeleton } from "./Dashboard/Skeleton";
import { SignInModal } from "./SignInModal";
import { UpdateModal } from "./UpdateModal";

import { Suspense } from "react";

export const AppView: React.FC = () => {
  const { authentication } = useGlobalStore();

  const currentAuthentication = authentication.state();

  if (currentAuthentication.status === "AUTHENTICATING") {
    return <Skeleton />;
  }

  if (currentAuthentication.status === "UNAUTHENTICATED") {
    return (
      <>
        <Skeleton />
        <SignInModal />
      </>
    );
  }

  return (
    <useAppStore.Provider
      key={currentAuthentication.user.id}
      user={currentAuthentication.user}
      family={currentAuthentication.family}
    >
      <Suspense fallback={<Skeleton />}>
        <App />
        <UpdateModal />
      </Suspense>
    </useAppStore.Provider>
  );
};
