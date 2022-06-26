import React from "react";

import { EnvironmentProvider } from "../environment-interface";
import { createBrowserEnvironment } from "../environments/browser";

const environment = createBrowserEnvironment();

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
