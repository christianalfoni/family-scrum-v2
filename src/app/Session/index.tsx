import { FamilyScrum } from "../FamilyScrum";
import { SessionState } from "../../state/SessionState";
import React from "react";
import { GoogleSignIn } from "./GoogleSignIn";
import { AuthLayout } from "@/components/auth-layout";
import { Text } from "@/components/text";

type Props = {
  session: SessionState;
};

function Session({ session }: Props) {
  let content: React.ReactNode;

  if (session.state.current === "AUTHENTICATING") {
    content = (
      <AuthLayout>
        <Text>Authenticating...</Text>
      </AuthLayout>
    );
  } else if (session.state.current === "UNAUTHENTICATED") {
    const state = session.state;

    content = <GoogleSignIn onSubmit={state.signIn} />;
  } else {
    content = <FamilyScrum familyScrum={session.state.familyScrum} />;
  }

  return (
    <div
      className="antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950 light"
      style={{ colorScheme: "light" }}
    >
      {content}
    </div>
  );
}

export default Session;
