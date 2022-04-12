import * as React from "react";
import { createReducer, StatesReducer } from "react-states";
import { useReducer } from "../../environment-interface";

type State = {
  state: "SELECTING_ONBOARDING";
};

type Action = {
  type: "CREATE_FAMILY_SELECTED";
};

export type OnboardingFeature = StatesReducer<State, Action>;

const featureContext = React.createContext({} as OnboardingFeature);

export const useFeature = () => React.useContext(featureContext);

const reducer = createReducer<OnboardingFeature>({
  SELECTING_ONBOARDING: {},
});

export const Feature = ({
  children,
  initialState = {
    state: "SELECTING_ONBOARDING",
  },
}: {
  children: React.ReactNode;
  initialState: State;
}) => {
  const feature = useReducer("Onboarding", reducer, initialState);

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
