import React, { Suspense } from "react";

import { use } from "impact-app";
import { useAppContext } from "../useAppContext";
import { useGroceriesContext } from "./useGroceriesContext";

import { Skeleton } from "../Dashboard/Skeleton";
import { Groceries } from "./Groceries";

export const GroceriesContext = () => {
  const { fetchGroceries } = useAppContext();

  const groceries = use(fetchGroceries());

  return (
    <useGroceriesContext.Provider groceries={groceries}>
      <Suspense fallback={<Skeleton />}>
        <Groceries />
      </Suspense>
    </useGroceriesContext.Provider>
  );
};
