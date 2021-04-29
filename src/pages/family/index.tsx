import React from "react";
import { DashboardFeature } from "../../features/DashboardFeature";
import { PageContainer } from "../PageContainer";
import { Dashboard } from "./Dashboard";

function FamilyPage() {
  return (
    <PageContainer>
      <DashboardFeature>
        <Dashboard />
      </DashboardFeature>
    </PageContainer>
  );
}

export default FamilyPage;
