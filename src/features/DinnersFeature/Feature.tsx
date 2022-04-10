import { createContext, useContext } from "react";
import { States, StatesTransition } from "react-states";
import { createReducer, useReducer } from "../../environment-interface";

type State = {
  state: "LIST";
};

type Action = {
  type: "ADD_DINNER";
};

export type DinnersFeature = States<State, Action>;

type Transition = StatesTransition<DinnersFeature>;

const featureContext = createContext({} as DinnersFeature);

const reducer = createReducer<DinnersFeature>({
  LIST: {},
});

export const useFeature = () => useContext(featureContext);

export const Feature = ({
  initialState = {
    state: "LIST",
  },
  children,
}: {
  initialState?: State;
  children: React.ReactNode;
}) => {
  const feature = useReducer("Dinners", reducer, initialState);

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
