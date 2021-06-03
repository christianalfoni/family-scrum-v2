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
  }
  | {
    state: 'LINKING_BARCODE'
    barcodeId: string
    groceryId: string
  }
  | {
    state: 'UNLINKING_BARCODE'
    barcodeId: string
    groceryId: string
  }

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
  } | {
    type: 'LINK_BARCODE'
    barcodeId: string
    groceryId: string
  } | {
    type: 'UNLINK_BARCODE'
    barcodeId: string
    groceryId: string
  }

type Event = UIEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

const defaultHandlers = {
  INCREASE_SHOP_COUNT: ({ id }: { id: string }): TransientContext => ({
    state: "INCREASING_SHOP_COUNT",
    id,
  }),
  RESET_SHOP_COUNT: ({ id }: { id: string }): TransientContext => ({
    state: "RESETTING_SHOP_COUNT",
    id,
  }),
  LINK_BARCODE: ({ groceryId, barcodeId }: { groceryId: string, barcodeId: string }): TransientContext => ({
    state: 'LINKING_BARCODE',
    groceryId,
    barcodeId
  }),
  UNLINK_BARCODE: ({ groceryId, barcodeId }: { groceryId: string, barcodeId: string }): TransientContext => ({
    state: 'UNLINKING_BARCODE',
    groceryId,
    barcodeId
  })
}

const reducer = createReducer<Context, Event, TransientContext>(
  {
    FILTERED: {
      ...defaultHandlers,
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
    },
    UNFILTERED: {
      ...defaultHandlers,
      GROCERY_CATEGORY_TOGGLED: ({ category }, { input }) => ({
        state: "FILTERED",
        input,
        category,
      }),
      GROCERY_INPUT_CHANGED: ({ input }, context) => ({
        ...context,
        input,
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
    LINKING_BARCODE: (_, prevContext) => prevContext,
    UNLINKING_BARCODE: (_, prevContext) => prevContext,
  }
);

export const useFeature = createHook(featureContext);

export const Feature = ({
  children,
  familyId,
  initialContext = {
    state: "UNFILTERED",
    input: "",
  },
}: {
  children: React.ReactNode;
  familyId: string;
  initialContext?: Context;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("Groceries", feature);
  }

  const [context] = feature;

  useEnterEffect(context, "ADDING_GROCERY", ({ category, name }) => {
    storage.addGrocery(familyId, category, name);
  });

  useEnterEffect(context, "INCREASING_SHOP_COUNT", ({ id }) => {
    storage.increaseGroceryShopCount(familyId, id);
  });

  useEnterEffect(context, "RESETTING_SHOP_COUNT", ({ id }) => {
    storage.resetGroceryShopCount(familyId, id);
  });

  useEnterEffect(context, "LINKING_BARCODE", ({ barcodeId, groceryId }) => {
    storage.linkBarcode(familyId, barcodeId, groceryId);
  });

  useEnterEffect(context, "UNLINKING_BARCODE", ({ barcodeId, groceryId }) => {
    storage.unlinkBarcode(familyId, barcodeId, groceryId);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
