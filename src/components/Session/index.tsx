import { Skeleton } from "../Dashboard/Skeleton";
import { SignInModal } from "./SignInModal";
import { FamilyScrum } from "../FamilyScrum";
import * as state from "../../state";

type Props = {
  session: state.Session;
};

function Session({ session }: Props) {
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
