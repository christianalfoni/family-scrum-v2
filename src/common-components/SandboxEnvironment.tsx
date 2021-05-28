import dynamic from "next/dynamic";
import React from "react";
import { EnvironmentProvider } from "../environment";
import { createAuthentication } from "../environment/authentication/sandbox";
import { createStorage } from "../environment/storage/sandbox";

export default function SandboxEnvironment({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EnvironmentProvider
      environment={{
        authentication: createAuthentication(),
        storage: createStorage(),
      }}
    >
      {children}
    </EnvironmentProvider>
  );
}
