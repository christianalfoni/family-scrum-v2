import { Skeleton } from "../Dashboard/Skeleton";
import { SignInModal } from "./SignInModal";
import { FamilyScrum } from "../FamilyScrum";
import * as state from "../../state";
import React from "react";

type Props = {
  session: state.Session;
};

function Session({ session }: Props) {
  let content: React.ReactNode;

  if (session.state.current === "AUTHENTICATING") {
    content = <Skeleton />;
  } else if (session.state.current === "UNAUTHENTICATED") {
    const state = session.state;

    content = (
      <>
        <Skeleton />
        <SignInModal onLoginClick={() => state.signIn()} />
      </>
    );
  } else {
    content = <FamilyScrum familyScrum={session.state.familyScrum} />;
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {content}
    </div>
  );
}

export default Session;
