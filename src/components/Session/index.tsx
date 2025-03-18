import { Skeleton } from "../Dashboard/Skeleton";
import { SignInModal } from "./SignInModal";
import { FamilyScrum } from "../FamilyScrum";
import React from "react";
import { useSession } from "./useSession";

function Session() {
  const session = useSession();

  let content: React.ReactNode;

  if (session.value.current === "AUTHENTICATING") {
    content = <Skeleton />;
  } else if (session.value.current === "UNAUTHENTICATED") {
    const state = session.value;

    content = (
      <>
        <Skeleton />
        <SignInModal onLoginClick={() => state.signIn()} />
      </>
    );
  } else {
    content = (
      <FamilyScrum user={session.value.user} family={session.value.family} />
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {content}
    </div>
  );
}

export default Session;
