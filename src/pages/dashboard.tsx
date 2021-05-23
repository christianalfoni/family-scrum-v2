import React from "react";
import { DashboardFeature } from "../features/DashboardFeature";
import { PageContainer } from "../components/PageContainer";
import { Dashboard } from "../components/Dashboard";

function DashboardPage() {
  return (
    <PageContainer>
      <DashboardFeature>
        <Dashboard />
      </DashboardFeature>
    </PageContainer>
  );
}

export default DashboardPage;
