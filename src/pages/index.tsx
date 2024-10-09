import React, { lazy } from "react";

import { GetStaticPropsContext } from "next";
import { useBrowser } from "../useBrowser";
import { Skeleton } from "../AppView/Dashboard/Skeleton";

const LazyMain = lazy(() => import("../main"));

function AppPage() {
  const isBrowser = useBrowser();

  // Next JS is not really the best solution for this app. We want everything to happen in the client and this is a way
  // to enforce a lazy load of the client app
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
