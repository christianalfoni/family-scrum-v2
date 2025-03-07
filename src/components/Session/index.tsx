import { Skeleton } from "../Dashboard/Skeleton";
import { SignInModal } from "./SignInModal";
import { FamilyScrum } from "../FamilyScrum";
import { Session } from "../../State/Session";

function Session({ session }: { session: Session }) {
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
