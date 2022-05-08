import { useReducer } from "react";
import {
  match,
  transition,
  TTransitions,
  useDevtools,
  useTransitionEffect,
} from "react-states";
import { useEnvironment } from "../../environment-interface";

const actions = {
  ADD_GROCERY: () => ({
    type: "ADD_GROCERY" as const,
  }),
  GROCERY_INPUT_CHANGED: (input: string) => ({
    type: "GROCERY_INPUT_CHANGED" as const,
    input,
  }),
  SHOP_GROCERY: (groceryId: string) => ({
    type: "SHOP_GROCERY" as const,
    groceryId,
  }),
  TOGGLE_NO_SLEEP: () => ({
    type: "TOGGLE_NO_SLEEP" as const,
  }),
};
type Action = ReturnType<typeof actions[keyof typeof actions]>;

const sleepStates = {
  ALLOW_SLEEP: () => ({
    state: "ALLOW_SLEEP" as const,
  }),
  PREVENT_SLEEP: () => ({
    state: "PREVENT_SLEEP" as const,
  }),
};

type SleepState = ReturnType<typeof sleepStates[keyof typeof sleepStates]>;

type BaseState = {
  sleep: SleepState;
  input: string;
};

const states = {
  FILTERED: ({ sleep, input }: Pick<BaseState, "sleep" | "input">) => ({
    state: "FILTERED" as const,
    input,
    sleep,
    SHOP_GROCERY: actions.SHOP_GROCERY,
    TOGGLE_NO_SLEEP: actions.TOGGLE_NO_SLEEP,
    GROCERY_INPUT_CHANGED: actions.GROCERY_INPUT_CHANGED,
    ADD_GROCERY: actions.ADD_GROCERY,
  }),
  UNFILTERED: ({ sleep }: Pick<BaseState, "sleep">) => ({
    state: "UNFILTERED" as const,
    sleep,
    GROCERY_INPUT_CHANGED: actions.GROCERY_INPUT_CHANGED,
    SHOP_GROCERY: actions.SHOP_GROCERY,
    TOGGLE_NO_SLEEP: actions.TOGGLE_NO_SLEEP,
  }),
};

type State = ReturnType<typeof states[keyof typeof states]>;

export const { FILTERED, UNFILTERED } = states;

const SHOP_GROCERY = (state: State) => ({
  ...state,
});

const TOGGLE_NO_SLEEP = (state: State) =>
  match(state, {
    FILTERED: (filteredState) =>
      FILTERED({
        ...filteredState,
        sleep: match(filteredState.sleep, {
          ALLOW_SLEEP: () => sleepStates.PREVENT_SLEEP(),
          PREVENT_SLEEP: () => sleepStates.ALLOW_SLEEP(),
        }),
      }),
    UNFILTERED: (unfilteredState) =>
      UNFILTERED({
        ...unfilteredState,
        sleep: match(unfilteredState.sleep, {
          ALLOW_SLEEP: () => sleepStates.PREVENT_SLEEP(),
          PREVENT_SLEEP: () => sleepStates.ALLOW_SLEEP(),
        }),
      }),
  });

const GROCERY_INPUT_CHANGED = (
  { sleep }: Pick<State, "sleep">,
  { input }: { input: string }
) =>
  input
    ? FILTERED({
        sleep,
        input,
      })
    : UNFILTERED({
        sleep,
      });

const transitions: TTransitions<State, Action> = {
  UNFILTERED: {
    GROCERY_INPUT_CHANGED,
    SHOP_GROCERY,
    TOGGLE_NO_SLEEP,
  },
  FILTERED: {
    GROCERY_INPUT_CHANGED,
    SHOP_GROCERY,
    TOGGLE_NO_SLEEP,
    ADD_GROCERY: (state) =>
      FILTERED({
        ...state,
        input: "",
      }),
  },
};

const reducer = (state: State, action: Action) =>
  transition(state, action, transitions);
export const useGroceriesShopping = ({
  initialState,
}: {
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const groceriesShoppingReducer = useReducer(
    reducer,
    initialState ||
      UNFILTERED({
        sleep: sleepStates.ALLOW_SLEEP(),
      })
  );

  useDevtools("GroceriesShopping", groceriesShoppingReducer);

  const [state] = groceriesShoppingReducer;

  useTransitionEffect(state, "FILTERED", "ADD_GROCERY", ({ input }) => {
    storage.storeGrocery({
      id: storage.createGroceryId(),
      name: input,
    });
  });

  useTransitionEffect(
    state,
    ["FILTERED", "UNFILTERED"],
    "SHOP_GROCERY",
    (_, { groceryId }) => {
      storage.deleteGrocery(groceryId);
    }
  );

  return groceriesShoppingReducer;
};
