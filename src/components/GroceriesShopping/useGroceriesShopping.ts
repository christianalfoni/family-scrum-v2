import { useReducer } from "react";
import {
  $COMMAND,
  IAction,
  ICommand,
  IState,
  match,
  pick,
  PickCommand,
  ReturnTypes,
  transition,
  TTransitions,
  useCommandEffect,
  useDevtools,
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
type Action = ReturnTypes<typeof actions, IAction>;

const commands = {
  ADD_GROCERY: (name: string) => ({
    cmd: "ADD_GROCERY" as const,
    name,
  }),
  SHOP_GROCERY: (groceryId: string) => ({
    cmd: "SHOP_GROCERY" as const,
    groceryId,
  }),
};

type Command = ReturnTypes<typeof commands, ICommand>;

const sleepStates = {
  ALLOW_SLEEP: () => ({
    state: "ALLOW_SLEEP" as const,
  }),
  PREVENT_SLEEP: () => ({
    state: "PREVENT_SLEEP" as const,
  }),
};

type SleepState = ReturnTypes<typeof sleepStates, IState>;

const states = {
  FILTERED: (
    params: {
      input: string;
      sleep: SleepState;
    },
    command?: PickCommand<Command, "ADD_GROCERY" | "SHOP_GROCERY">
  ) => ({
    state: "FILTERED" as const,
    [$COMMAND]: command,
    ...params,
    ...pick(
      actions,
      "SHOP_GROCERY",
      "TOGGLE_NO_SLEEP",
      "GROCERY_INPUT_CHANGED",
      "ADD_GROCERY"
    ),
  }),
  UNFILTERED: (
    params: {
      sleep: SleepState;
    },
    command?: PickCommand<Command, "SHOP_GROCERY">
  ) => ({
    state: "UNFILTERED" as const,
    [$COMMAND]: command,
    ...params,
    ...pick(
      actions,
      "GROCERY_INPUT_CHANGED",
      "SHOP_GROCERY",
      "TOGGLE_NO_SLEEP"
    ),
  }),
};

type State = ReturnTypes<typeof states, IState>;

export const { FILTERED, UNFILTERED } = states;

const SHOP_GROCERY = (state: State, { groceryId }: { groceryId: string }) =>
  match(state, {
    UNFILTERED: (unfilteredState) =>
      UNFILTERED(unfilteredState, commands.SHOP_GROCERY(groceryId)),
    FILTERED: (filteredState) =>
      FILTERED(filteredState, commands.SHOP_GROCERY(groceryId)),
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
      FILTERED(
        {
          ...state,
          input: "",
        },
        commands.ADD_GROCERY(state.input)
      ),
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

  useCommandEffect(state, "ADD_GROCERY", ({ name }) => {
    storage.storeGrocery({
      id: storage.createGroceryId(),
      name,
    });
  });

  return groceriesShoppingReducer;
};
