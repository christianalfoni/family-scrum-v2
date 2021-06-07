import { useReducer } from "react";
import levenshtein from "fast-levenshtein";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { Barcodes, Groceries, Grocery } from "../DashboardFeature/Feature";

type Context =
  | {
    state: "FILTERED";
    input: string;
  }
  | {
    state: "UNFILTERED";
  };

type TransientContext =
  | {
    state: "ADDING_GROCERY";
    name: string;
  }
  | {
    state: "DELETING_GROCERY";
    groceryId: string
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
  } | {
    state: 'SHOPPING_GROCERY'
    groceryId: string
    shoppingListLength: number
  }

type UIEvent =
  | {
    type: "ADD_GROCERY";
  }
  | {
    type: 'SHOP_GROCERY'
    groceryId: string
    shoppingListLength: number
  }
  | {
    type: "DELETE_GROCERY";
    groceryId: string
  }
  | {
    type: "GROCERY_INPUT_CHANGED";
    input: string;
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
  UNLINK_BARCODE: ({ barcodeId }: { barcodeId: string }): TransientContext => ({
    state: 'UNLINKING_BARCODE',
    barcodeId
  }),
  DELETE_GROCERY: ({ groceryId }: { groceryId: string }): TransientContext => ({
    state: 'DELETING_GROCERY',
    groceryId
  })
}

const reducer = createReducer<Context, Event, TransientContext>(
  {
    FILTERED: {
      ...defaultHandlers,
      GROCERY_INPUT_CHANGED: ({ input }, context) => ({
        ...context,
        input,
      }),
      ADD_GROCERY: (_, { input }) => ({
        state: "ADDING_GROCERY",
        name: input,
      }),
    },
    UNFILTERED: {
      ...defaultHandlers,
      GROCERY_INPUT_CHANGED: ({ input }, context) => input ? ({
        state: 'FILTERED',
        input,
      }) : context,
    },
  },
  {
    ADDING_GROCERY: () => ({
      state: "UNFILTERED",
      input: "",
    }),
    DELETING_GROCERY: (_, prevContext) => prevContext,
    INCREASING_SHOP_COUNT: (_, prevContext) => prevContext,
    RESETTING_SHOP_COUNT: (_, prevContext) => prevContext,
    LINKING_BARCODE: (_, prevContext) => prevContext,
    UNLINKING_BARCODE: (_, prevContext) => prevContext,
    SHOPPING_GROCERY: (_, prevContext) => prevContext
  }
);

export const useFeature = createHook(featureContext);

export const selectors = {
  barcodesByGroceryId: (barcodes: Barcodes) =>
    Object.keys(barcodes).reduce<{ [groceryId: string]: string[] }>(
      (aggr, barcodeId) => {
        const barcode = barcodes[barcodeId];

        if (barcode.groceryId) {
          aggr[barcode.groceryId] = (aggr[barcode.groceryId] || []).concat(barcodeId);
        }

        return aggr;
      },
      {}
    ),
  unlinkedBarcodes: (barcodes: Barcodes) =>
    Object.keys(barcodes).filter((barcodeId) => !barcodes[barcodeId].groceryId),
  sortedGroceriesByName: (groceries: Groceries) => Object.values(groceries).sort((a, b) => {
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1
    } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1
    }

    return 0
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
}

export const Feature = ({
  children,
  familyId,
  initialContext = {
    state: "UNFILTERED",
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

  useEnterEffect(context, "ADDING_GROCERY", ({ name }) => {
    storage.addGrocery(familyId, name);
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

  useEnterEffect(context, "UNLINKING_BARCODE", ({ barcodeId }) => {
    storage.unlinkBarcode(familyId, barcodeId);
  });

  useEnterEffect(context, 'DELETING_GROCERY', ({ groceryId }) => {
    storage.deleteGrocery(familyId, groceryId);
  });

  useEnterEffect(context, 'SHOPPING_GROCERY', ({ groceryId, shoppingListLength }) => {
    storage.shopGrocery(familyId, groceryId, shoppingListLength)
  })

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
