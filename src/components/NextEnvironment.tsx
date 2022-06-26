import React from "react";

import { EnvironmentProvider } from "../environment-interface";
import { createNextEnvironment } from "../environments/next";

const environment = createNextEnvironment();

export default function NextEnvironment({
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
