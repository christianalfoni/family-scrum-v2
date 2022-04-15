import { StatesReducer, useCommandEffect } from "react-states";

import {
  createReducer,
  createReducerHandlers,
  useEnvironment,
  useReducer,
} from "../../environment-interface";

type SleepState =
  | {
      state: "ALLOW_SLEEP";
    }
  | {
      state: "PREVENT_SLEEP";
    };

type State =
  | {
      state: "FILTERED";
      input: string;
      sleep: SleepState;
    }
  | {
      state: "UNFILTERED";
      sleep: SleepState;
    };

type Action =
  | {
      type: "ADD_GROCERY";
    }
  | {
      type: "GROCERY_INPUT_CHANGED";
      input: string;
    }
  | {
      type: "SHOP_GROCERY";
      groceryId: string;
    }
  | {
      type: "TOGGLE_NO_SLEEP";
    };

type Command = {
  cmd: "ADD_GROCERY";
  name: string;
};

export type GroceriesShoppingReducer = StatesReducer<State, Action, Command>;

const baseHandlers = createReducerHandlers<GroceriesShoppingReducer>({
  SHOP_GROCERY: ({ state, action: { groceryId }, transition }) =>
    transition(state, {
      cmd: "$CALL_ENVIRONMENT",
      target: "storage.deleteGrocery",
      params: [groceryId],
    }),
  TOGGLE_NO_SLEEP: ({ state, transition }) =>
    transition({
      ...state,
      sleep:
        state.sleep.state === "ALLOW_SLEEP"
          ? {
              state: "PREVENT_SLEEP",
            }
          : {
              state: "ALLOW_SLEEP",
            },
    }),
});

const reducer = createReducer<GroceriesShoppingReducer>({
  UNFILTERED: {
    ...baseHandlers,
    GROCERY_INPUT_CHANGED: ({ state, action: { input }, transition }) =>
      input
        ? {
            ...state,
            state: "FILTERED",
            input,
          }
        : state,
  },
  FILTERED: {
    ...baseHandlers,
    ADD_GROCERY: ({ state, transition }) =>
      transition(
        {
          ...state,
          state: "UNFILTERED",
        },
        {
          cmd: "ADD_GROCERY",
          name: state.input,
        }
      ),
    GROCERY_INPUT_CHANGED: ({ state, action: { input }, transition }) =>
      input
        ? transition({
            ...state,
            input,
          })
        : transition({
            state: "UNFILTERED",
            sleep: state.sleep,
          }),
  },
});

export const useGroceriesShopping = ({
  initialState,
}: {
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const groceriesShoppingReducer = useReducer(
    "GroceriesShopping",
    reducer,
    initialState || {
      state: "UNFILTERED",
      sleep: {
        state: "ALLOW_SLEEP",
      },
    }
  );

  const [state] = groceriesShoppingReducer;

  useCommandEffect(state, "ADD_GROCERY", ({ name }) => {
    storage.storeGrocery({
      id: storage.createGroceryId(),
      name,
    });
  });

  return groceriesShoppingReducer;
};
