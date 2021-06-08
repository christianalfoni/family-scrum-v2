import dynamic from "next/dynamic";
import React from "react";
import { EnvironmentProvider } from "../environment";
import { createAuthentication } from "../environment/authentication/next";
import { createCapture } from "../environment/capture/next";
import { createPreventScreenSleep } from "../environment/preventScreenSleep/next";
import { createStorage } from "../environment/storage/next";
import { createVersion } from "../environment/version/next";
import { createVisibility } from "../environment/visibility/next";

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
        preventScreenSleep: createPreventScreenSleep(),
        version: createVersion(),
        visibility: createVisibility(),
        capture: createCapture(),
      }}
    >
      {children}
    </EnvironmentProvider>
  );
}
