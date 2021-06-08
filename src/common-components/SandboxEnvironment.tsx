import React from "react";
import { EnvironmentProvider } from "../environment";
import { createAuthentication } from "../environment/authentication/sandbox";
import { createCapture } from "../environment/capture/sandbox";
import { createPreventScreenSleep } from "../environment/preventScreenSleep/sandbox";
import { createStorage } from "../environment/storage/sandbox";
import { createVersion } from "../environment/version/sandbox";
import { createVisibility } from "../environment/visibility/sandbox";

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
        version: createVersion("1.0.0", "1.0.0"),
        visibility: createVisibility(),
        capture: createCapture(),
      }}
    >
      {children}
    </EnvironmentProvider>
  );
}
