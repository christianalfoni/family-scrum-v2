import { createStoresProvider, observe, useStore } from "impact-app";
import { SessionStore } from "../stores/SessionStore";
import { DashboardSkeleton } from "./Dashboard/DashboardContent";
import { SignInModal } from "./SignInModal";
import { Dashboard } from "./Dashboard";
import { UserStore } from "../stores/UserStore";

const DashboardStoresProvider = createStoresProvider({ UserStore });

const PageContainer: React.FC = observe(() => {
  const sessionStore = useStore(SessionStore);

  if (sessionStore.state.status === "AUTHENTICATING") {
    return <DashboardSkeleton />;
  }

  if (sessionStore.state.status === "UNAUTHENTICATED") {
    return (
      <>
        <DashboardSkeleton />
        <SignInModal />
      </>
    );
  }

  return (
    <DashboardStoresProvider UserStore={sessionStore.state.user}>
      <Dashboard />
    </DashboardStoresProvider>
  );
});

export default PageContainer;
