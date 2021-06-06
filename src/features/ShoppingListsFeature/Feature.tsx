import { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { Groceries } from "../DashboardFeature";

type ListContext = {
  state: 'GROCERIES_LIST'
} | {
  state: 'GENERIC_LIST'
  listId: string
}

type Context = {
  state: "EDITING";
  list: ListContext
} | {
  state: 'SHOPPING'
  list: ListContext
}


type UIEvent = {
  type: 'TOGGLE_SHOPPING',
}

type Event = UIEvent;

const featureContext = createContext<Context, UIEvent>();

const reducer = createReducer<Context, Event>(
  {
    EDITING: {
      TOGGLE_SHOPPING: (_, context) => ({ state: 'SHOPPING', list: context.list })
    },
    SHOPPING: {
      TOGGLE_SHOPPING: (_, context) => ({ state: 'EDITING', list: context.list })
    }
  },
);

export const useFeature = createHook(featureContext);


export const Feature = ({
  familyId,
  children,
  initialContext = {
    state: "EDITING",
    list: {
      state: 'GROCERIES_LIST'
    }
  },
}: {
  familyId: string;
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("GroceryList", feature);
  }

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
