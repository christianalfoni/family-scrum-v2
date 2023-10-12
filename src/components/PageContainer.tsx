import { createScopeProvider, observe } from "impact-app";
import { useSession } from "../stores/SessionStore";
import { DashboardSkeleton } from "./Dashboard/DashboardContent";
import { SignInModal } from "./SignInModal";
import { Dashboard } from "./Dashboard";
import { UserStore } from "../stores/UserStore";
import { GroceriesStore } from "../stores/GroceriesStore";

const SessionScope = createScopeProvider({
  UserStore,
  GroceriesStore,
});

const PageContainer: React.FC = observe(() => {
  const session = useSession();

  if (session.state.status === "AUTHENTICATING") {
    return <DashboardSkeleton />;
  }

  if (session.state.status === "UNAUTHENTICATED") {
    return (
      <>
        <DashboardSkeleton />
        <SignInModal />
      </>
    );
  }

  return (
    <SessionScope
      UserStore={session.state.user}
      GroceriesStore={session.state.user}
    >
      <Dashboard />
    </SessionScope>
  );
});

export default PageContainer;
