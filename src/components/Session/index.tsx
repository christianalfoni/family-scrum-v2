import { Skeleton } from "../Dashboard/Skeleton";
import { SignInModal } from "./SignInModal";
import { FamilyScrum } from "../FamilyScrum";
import React from "react";
import { useSession } from "./useSession";

function Session() {
  const session = useSession();

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
    content = (
      <FamilyScrumContext
        user={session.state.user}
        family={session.state.family}
      >
        <FamilyScrum />
      </FamilyScrumContext>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {content}
    </div>
  );
}

export default Session;
