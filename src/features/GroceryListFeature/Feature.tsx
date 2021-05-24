import { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";

type Context = {
  state: "LIST";
};

type TransientContext = {
  state: "SHOPPING_GROCERY";
  id: string;
};

type UIEvent = {
  type: "SHOP_GROCERY";
  id: string;
};

type Event = UIEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

const reducer = createReducer<Context, Event, TransientContext>(
  {
    LIST: {
      SHOP_GROCERY: ({ id }) => ({ state: "SHOPPING_GROCERY", id }),
    },
  },
  {
    SHOPPING_GROCERY: () => ({
      state: "LIST",
    }),
  }
);

export const useFeature = createHook(featureContext);

export const Feature = ({
  familyId,
  children,
  initialContext = {
    state: "LIST",
  },
}: {
  familyId: string;
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.browser) {
    useDevtools("GroceryList", feature);
  }

  const [context, send] = feature;

  useEnterEffect(context, "SHOPPING_GROCERY", ({ id }) => {
    storage.resetGroceryShopCount(familyId, id);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
