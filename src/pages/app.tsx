import React from "react";
import { PageContainer } from "../common-components/PageContainer";
import { DashboardFeature } from "../features/DashboardFeature";
import { Dashboard } from "../app-components/Dashboard";

function AppPage() {
  return (
    <PageContainer>
      <DashboardFeature>
        <Dashboard />
      </DashboardFeature>
    </PageContainer>
  );
}

export default AppPage;
