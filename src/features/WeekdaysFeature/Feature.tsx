import { useReducer } from "react";
import { createContext, createHook, createReducer } from "react-states";
import { useDevtools } from "react-states/devtools";

type Context = {
  state: "OVERVIEW";
};

type Event = {
  type: "NOOP";
};

const featureContext = createContext<Context, Event>();

const reducer = createReducer<Context, Event>({
  OVERVIEW: {},
});

export const useFeature = createHook(featureContext);

export const Feature = ({
  children,
  initialContext = {
    state: "OVERVIEW",
  },
}: {
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const feature = useReducer(reducer, initialContext);

  if (process.browser) {
    useDevtools("Weekdays", feature);
  }

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
