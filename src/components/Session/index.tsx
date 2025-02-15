import { Skeleton } from "../Dashboard/Skeleton";
import { useSession } from "../../state";
import { SignInModal } from "./SignInModal";
import { FamilyScrum } from "../FamilyScrum";

function Session() {
  const session = useSession();

  if (session.state.current === "AUTHENTICATING") {
    return <Skeleton />;
  }

  if (session.state.current === "UNAUTHENTICATED") {
    const state = session.state;

    return (
      <>
        <Skeleton />
        <SignInModal onLoginClick={() => state.signIn()} />
      </>
    );
  }

  return <FamilyScrum />;
}

export default Session;
