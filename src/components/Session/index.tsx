import { Skeleton } from "../Dashboard/Skeleton";
import { SignInModal } from "./SignInModal";
import { FamilyScrum } from "../FamilyScrum";
import React from "react";
import { useSession } from "./useSession";

function Session() {
  const session = useSession();

  let content: React.ReactNode;

  if (session.current === "AUTHENTICATING") {
    content = <Skeleton />;
  } else if (session.current === "UNAUTHENTICATED") {
    content = (
      <>
        <Skeleton />
        <SignInModal onLoginClick={session.signIn} />
      </>
    );
  } else {
    content = <FamilyScrum user={session.user} family={session.family} />;
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {content}
    </div>
  );
}

export default Session;
