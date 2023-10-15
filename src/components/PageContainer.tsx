import { createScopeProvider, observe } from "impact-app";
import { useSession } from "../stores/SessionStore";
import { DashboardSkeleton } from "./Dashboard/DashboardContent";
import { SignInModal } from "./SignInModal";
import { Dashboard } from "./Dashboard";
import { UserStore } from "../stores/UserStore";
import { GroceriesStore } from "../stores/GroceriesStore";
import { TodosStore } from "../stores/TodosStore";
import { CheckListItemsStore } from "../stores/CheckListItemsStore";
import { DinnersStore } from "../stores/DinnersStore";
import { WeeksStore } from "../stores/WeeksStore";

const SessionScope = createScopeProvider({
  UserStore,
  GroceriesStore,
  TodosStore,
  CheckListItemsStore,
  DinnersStore,
  WeeksStore,
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
      TodosStore={session.state.user}
      CheckListItemsStore={session.state.user}
      DinnersStore={session.state.user}
      WeeksStore={session.state.user}
    >
      <Dashboard />
    </SessionScope>
  );
});

export default PageContainer;
