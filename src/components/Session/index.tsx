import { Skeleton } from "../Dashboard/Skeleton";
import { SignInModal } from "./SignInModal";
import { FamilyScrum } from "../FamilyScrum";
import { SessionState } from "../../state/session";

function Session({ session }: { session: SessionState }) {
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

  return <FamilyScrum familyScrum={session.state.familyScrum} />;
}

export default Session;
