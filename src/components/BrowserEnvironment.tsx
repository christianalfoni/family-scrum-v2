import React from "react";

import { EnvironmentProvider } from "../environment-interface";
import { environment } from "../environments/browser";

export default function BrowserEnvironment({
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
