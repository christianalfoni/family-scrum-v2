import { useReducer } from "react";
import { createContext, createHook, createReducer } from "react-states";
import { useDevtools } from "react-states/devtools";

type Context = {
  state: "LIST";
};

type Event = {
  type: "NOOP";
};

const featureContext = createContext<Context, Event>();

const reducer = createReducer<Context, Event>({
  LIST: {},
});

export const useFeature = createHook(featureContext);

export const Feature = ({
  children,
  initialContext = {
    state: "LIST",
  },
}: {
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const feature = useReducer(reducer, initialContext);

  if (process.browser) {
    useDevtools("GroceryList", feature);
  }

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
