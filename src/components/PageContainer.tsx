import { observe, useStore } from "impact-app";
import { SessionStore } from "../stores/SessionStore";
import { DashboardSkeleton } from "./Dashboard/DashboardContent";
import { SignInModal } from "./SignInModal";
import { Dashboard } from "./Dashboard";

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

  return <Dashboard />;
});

export default PageContainer;
