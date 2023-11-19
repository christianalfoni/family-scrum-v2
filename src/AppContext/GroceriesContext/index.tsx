import React, { Suspense } from "react";

import { use } from "impact-app";
import { useAppContext } from "../useAppContext";
import { useGroceriesContext } from "./useGroceriesContext";

import { Skeleton } from "../DashboardContext/Skeleton";
import { Groceries } from "./Groceries";

export const GroceriesContext = () => {
  const { getGroceries } = useAppContext();

  const groceries = use(getGroceries());

  return (
    <useGroceriesContext.Provider groceries={groceries}>
      <Suspense fallback={<Skeleton />}>
        <Groceries />
      </Suspense>
    </useGroceriesContext.Provider>
  );
};
