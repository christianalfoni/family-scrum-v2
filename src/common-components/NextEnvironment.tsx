import React from "react";

import { EnvironmentProvider } from "../environment-interface";
import { environment } from "../environments/next";

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
