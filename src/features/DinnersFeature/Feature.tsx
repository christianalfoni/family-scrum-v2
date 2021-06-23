import { useReducer } from "react";
import { createContext, createHook, createReducer } from "react-states";
import { useDevtools } from "react-states/devtools";

type Context = {
  state: "LIST";
};

type UIEvent = {
  type: "ADD_DINNER";
};

type Event = UIEvent;

const featureContext = createContext<Context, Event>();

const reducer = createReducer<Context, Event>({
  LIST: {},
});

export const useFeature = createHook(featureContext);

export const Feature = ({
  initialContext = {
    state: "LIST",
  },
  children,
}: {
  initialContext?: Context;
  children: React.ReactNode;
}) => {
  const feature = useReducer(reducer, initialContext);

  if (process.browser && process.env.NODE_ENV === "development") {
    useDevtools("Dinners", feature);
  }

  const [context, send] = feature;

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
