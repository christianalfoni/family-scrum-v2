import { createStoresProvider, observe, useStore } from "impact-app";
import { SessionStore } from "../stores/SessionStore";
import { DashboardSkeleton } from "./Dashboard/DashboardContent";
import { SignInModal } from "./SignInModal";
import { Dashboard } from "./Dashboard";
import { UserStore } from "../stores/UserStore";
import { GroceriesStore } from "../stores/GroceriesStore";

const DashboardStoresProvider = createStoresProvider({
  UserStore,
  GroceriesStore,
});

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
    <DashboardStoresProvider
      UserStore={sessionStore.state.user}
      GroceriesStore={sessionStore.state.user}
    >
      <Dashboard />
    </DashboardStoresProvider>
  );
});

export default PageContainer;
