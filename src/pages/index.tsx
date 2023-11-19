import React, { lazy } from "react";

import { GetStaticPropsContext } from "next";
import { useBrowser } from "../useBrowser";
import { Skeleton } from "../AppContext/DashboardContext/Skeleton";

const LazyMain = lazy(() => import("../main"));

function AppPage() {
  const isBrowser = useBrowser();

  return isBrowser ? <LazyMain /> : <Skeleton />;
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
