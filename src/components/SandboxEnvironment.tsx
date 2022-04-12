import React from "react";

import { EnvironmentProvider } from "../environment-interface";
import { environment } from "../environments/sandbox";

export default function SandboxEnvironment({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EnvironmentProvider environment={environment}>
      {children}
    </EnvironmentProvider>
  );
}
