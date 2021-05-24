import { useReducer } from "react";
import { createContext, createHook, createReducer } from "react-states";
import { useDevtools } from "react-states/devtools";
import { StorageEvent } from "../../environment/storage";

type Context = {
  state: "PLANNING";
};

type UIEvent = {
  type: "";
};

type Event = UIEvent | StorageEvent;

const featureContext = createContext<Context, UIEvent>();

const reducer = createReducer<Context, Event>({
  PLANNING: {},
});

export const useFeature = createHook(featureContext);

export const Feature = ({
  familyId,
  weekId,
  children,
  initialContext = {
    state: "PLANNING",
  },
}: {
  familyId: string;
  weekId: string;
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("PlanWeek", feature);
  }

  const [context, send] = feature;

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
