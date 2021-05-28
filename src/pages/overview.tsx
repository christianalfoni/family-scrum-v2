import React from "react";
import { DashboardFeature } from "../features/DashboardFeature";
import { PageContainer } from "../common-components/PageContainer";
import { Dashboard } from "../overview-components/Dashboard";
import { GetStaticPropsContext } from "next";

function OverviewPage() {
  return (
    <PageContainer>
      <DashboardFeature>
        <Dashboard />
      </DashboardFeature>
    </PageContainer>
  );
}

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: require(`../../messages/overview/${locale}.json`),
    },
  };
}

export default OverviewPage;
