import levenshtein from "fast-levenshtein";
import { createContext, useContext } from "react";
import {
  PickState,
  StatesReducer,
  StatesHandlers,
  StatesTransition,
  useCommandEffect,
} from "react-states";

import {
  createReducer,
  useEnvironment,
  useReducer,
} from "../../environment-interface";

import {
  DashboardFeature,
  Groceries,
  Grocery,
} from "../DashboardFeature/Feature";

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

type Command =
  | {
      cmd: "SHOP_GROCERY";
      groceryId: string;
    }
  | {
      cmd: "ADD_GROCERY";
      name: string;
    };

export type GroceriesShoppingFeature = StatesReducer<State, Action, Command>;

type Transition = StatesTransition<GroceriesShoppingFeature>;

const featureContext = createContext({} as GroceriesShoppingFeature);

const baseHandlers: StatesHandlers<GroceriesShoppingFeature> = {
  SHOP_GROCERY: (state, { groceryId }): Transition => [
    state,
    {
      cmd: "SHOP_GROCERY",
      groceryId,
    },
  ],
  TOGGLE_NO_SLEEP: (state): Transition => ({
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
};

const reducer = createReducer<GroceriesShoppingFeature>({
  UNFILTERED: {
    ...baseHandlers,
    GROCERY_INPUT_CHANGED: (state, { input }) =>
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
    ADD_GROCERY: (state): Transition => [
      {
        ...state,
        state: "UNFILTERED",
      },
      {
        cmd: "ADD_GROCERY",
        name: state.input,
      },
    ],
    GROCERY_INPUT_CHANGED: (state, { input }): Transition =>
      input
        ? {
            ...state,
            input,
          }
        : {
            state: "UNFILTERED",
            sleep: state.sleep,
          },
  },
});

export const useFeature = () => useContext(featureContext);

export const selectors = {
  shopCount(groceries: Groceries) {
    return Object.values(groceries).length;
  },
  groceriesToShop(groceries: Groceries) {
    return Object.values(groceries);
  },
  sortedGroceriesByNameAndCreated: (groceries: Grocery[], since: number) =>
    groceries.slice().sort((a, b) => {
      if (a.created > since || a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      }

      return 0;
    }),
  filteredGroceriesByInput: (groceries: Grocery[], input: string) => {
    if (input) {
      const lowerCaseInput = input.toLocaleLowerCase();

      return groceries.filter((grocery) => {
        const lowerCaseGroceryName = grocery.name.toLowerCase();

        return (
          lowerCaseGroceryName.includes(lowerCaseInput) ||
          levenshtein.get(grocery.name.toLowerCase(), input.toLowerCase()) < 3
        );
      });
    }

    return groceries;
  },
};

export const Feature = ({
  children,
  familyId,
  dashboard,
  initialState = {
    state: "UNFILTERED",
    sleep: {
      state: "ALLOW_SLEEP",
    },
  },
}: {
  children: React.ReactNode;
  familyId: string;
  dashboard: PickState<DashboardFeature, "LOADED">;
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer("GroceriesShopping", reducer, initialState);

  const [state] = feature;

  useCommandEffect(state, "ADD_GROCERY", ({ name }) => {
    storage.addGrocery(familyId, name);
  });

  useCommandEffect(state, "SHOP_GROCERY", ({ groceryId }) => {
    storage.deleteGrocery(familyId, groceryId);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
