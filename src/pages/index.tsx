import React, { lazy } from "react";

import { GetStaticPropsContext } from "next";
import { useBrowser } from "../hooks/useBrowser";
import { DashboardSkeleton } from "../components/Dashboard/DashboardContent";

const LazyPageContainer = lazy(() => import("../components/PageContainer"));

function AppPage() {
  const isBrowser = useBrowser();

  return isBrowser ? <LazyPageContainer /> : <DashboardSkeleton />;
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
