import React from "react";
import { PageContainer } from "../components/PageContainer";
import { DashboardFeature } from "../features/DashboardFeature";
import { Dashboard } from "../components/Dashboard";
import { GetStaticPropsContext } from "next";

function AppPage() {
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
      messages: {
        ...require(`../../messages/session/${locale}.json`),
        ...require(`../../messages/app/${locale}.json`),
      },
    },
  };
}

export default AppPage;
