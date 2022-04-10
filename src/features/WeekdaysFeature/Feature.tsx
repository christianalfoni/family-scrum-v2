import { createContext, useContext } from "react";
import { States } from "react-states";
import { createReducer, useReducer } from "../../environment-interface";

type State = {
  state: "OVERVIEW";
};

type Action = {
  type: "NOOP";
};

export type WeekdaysFeature = States<State, Action>;

const featureContext = createContext({} as WeekdaysFeature);

const reducer = createReducer<WeekdaysFeature>({
  OVERVIEW: {},
});

export const useFeature = () => useContext(featureContext);

export const Feature = ({
  children,
  initialState = {
    state: "OVERVIEW",
  },
}: {
  children: React.ReactNode;
  initialState?: State;
}) => {
  const feature = useReducer("Weekdays", reducer, initialState);

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
