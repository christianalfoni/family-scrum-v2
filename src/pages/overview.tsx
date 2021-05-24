import React from "react";
import { DashboardFeature } from "../features/DashboardFeature";
import { PageContainer } from "../common-components/PageContainer";
import { Dashboard } from "../overview-components/Dashboard";

function OverviewPage() {
  return (
    <PageContainer>
      <DashboardFeature>
        <Dashboard />
      </DashboardFeature>
    </PageContainer>
  );
}

export default OverviewPage;
