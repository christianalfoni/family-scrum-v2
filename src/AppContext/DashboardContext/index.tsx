import React from "react";

import { useDashboardContext } from "./useDashboardContext";
import { Dashboard } from "./Dashboard";

export function DashboardContext() {
  return (
    <useDashboardContext.Provider>
      <Dashboard />
    </useDashboardContext.Provider>
  );
}
