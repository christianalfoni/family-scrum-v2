import { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { GroceryCategoryDTO as GroceryCategory } from "../../environment/storage";

export { GroceryCategory };

type Context =
  | {
      state: "FILTERED";
      category: GroceryCategory;
      input: string;
    }
  | {
      state: "UNFILTERED";
      input: string;
    };

type TransientContext =
  | {
      state: "ADDING_GROCERY";
      name: string;
      category: GroceryCategory;
    }
  | {
      state: "INCREASING_SHOP_COUNT";
      id: string;
    }
  | {
      state: "RESETTING_SHOP_COUNT";
      id: string;
    };

type UIEvent =
  | {
      type: "ADD_GROCERY";
    }
  | {
      type: "GROCERY_INPUT_CHANGED";
      input: string;
    }
  | {
      type: "GROCERY_CATEGORY_TOGGLED";
      category: GroceryCategory;
    }
  | {
      type: "INCREASE_SHOP_COUNT";
      id: string;
    }
  | {
      type: "RESET_SHOP_COUNT";
      id: string;
    };

type Event = UIEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

const reducer = createReducer<Context, Event, TransientContext>(
  {
    FILTERED: {
      GROCERY_CATEGORY_TOGGLED: (
        { category },
        { input, category: existingCategory }
      ) =>
        existingCategory === category
          ? {
              state: "UNFILTERED",
              input,
            }
          : {
              state: "FILTERED",
              input,
              category,
            },
      GROCERY_INPUT_CHANGED: ({ input }, context) => ({
        ...context,
        input,
      }),
      ADD_GROCERY: (_, { category, input }) => ({
        state: "ADDING_GROCERY",
        category,
        name: input,
      }),
      INCREASE_SHOP_COUNT: ({ id }, context) => ({
        state: "INCREASING_SHOP_COUNT",
        id,
      }),
      RESET_SHOP_COUNT: ({ id }, context) => ({
        state: "RESETTING_SHOP_COUNT",
        id,
      }),
    },
    UNFILTERED: {
      GROCERY_CATEGORY_TOGGLED: ({ category }, { input }) => ({
        state: "FILTERED",
        input,
        category,
      }),
      GROCERY_INPUT_CHANGED: ({ input }, context) => ({
        ...context,
        input,
      }),
      INCREASE_SHOP_COUNT: ({ id }) => ({
        state: "INCREASING_SHOP_COUNT",
        id,
      }),
      RESET_SHOP_COUNT: ({ id }) => ({
        state: "RESETTING_SHOP_COUNT",
        id,
      }),
    },
  },
  {
    ADDING_GROCERY: ({ category }) => ({
      state: "FILTERED",
      category,
      input: "",
    }),
    INCREASING_SHOP_COUNT: (_, prevContext) => prevContext,
    RESETTING_SHOP_COUNT: (_, prevContext) => prevContext,
  }
);

export const useFeature = createHook(featureContext);

export const Feature = ({
  children,
  familyUid,
  initialContext = {
    state: "UNFILTERED",
    input: "",
  },
}: {
  children: React.ReactNode;
  familyUid: string;
  initialContext?: Context;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("Groceries", feature);
  }

  const [context] = feature;

  useEnterEffect(context, "ADDING_GROCERY", ({ category, name }) => {
    storage.addGrocery(familyUid, category, name);
  });

  useEnterEffect(context, "INCREASING_SHOP_COUNT", ({ id }) => {
    storage.increaseGroceryShopCount(familyUid, id);
  });

  useEnterEffect(context, "RESETTING_SHOP_COUNT", ({ id }) => {
    storage.resetGroceryShopCount(familyUid, id);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
