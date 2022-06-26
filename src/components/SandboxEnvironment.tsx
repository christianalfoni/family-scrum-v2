import React from "react";

import { EnvironmentProvider } from "../environment-interface";
import { createSandboxEnvironment } from "../environments/sandbox";

const environment = createSandboxEnvironment();

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
