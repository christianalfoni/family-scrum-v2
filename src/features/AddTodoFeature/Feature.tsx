import { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";

type ValidationContext =
  | {
      state: "VALID";
    }
  | {
      state: "INVALID";
    };

type BaseContext = {
  description: string;
  validation: ValidationContext;
};

type Context = BaseContext &
  (
    | {
        state: "DEFINING_TODO";
      }
    | {
        state: "DEFINING_EVENT";
        date: number;
      }
  );

type TransientContext =
  | {
      state: "ADDING_TODO";
      description: string;
    }
  | {
      state: "ADDING_EVENT";
      description: string;
      date: number;
    };

type UIEvent =
  | {
      type: "DESCRIPTION_CHANGED";
      description: string;
    }
  | {
      type: "DATE_CHANGED";
      date: number;
    }
  | {
      type: "ADD_DATE";
    }
  | {
      type: "ADD_EVENT";
    }
  | {
      type: "ADD_TODO";
    }
  | {
      type: "CANCEL_DATE";
    };

type Event = UIEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

const DESCRIPTION_CHANGED = (
  { description }: { description: string },
  context: Context
): Context => ({
  ...context,
  validation: {
    state: description ? "VALID" : "INVALID",
  },
  description,
});

const reducer = createReducer<Context, Event, TransientContext>(
  {
    DEFINING_TODO: {
      DESCRIPTION_CHANGED,
      ADD_DATE: (_, context) => ({
        ...context,
        state: "DEFINING_EVENT",
        date: Date.now(),
      }),
      ADD_TODO: (_, context) =>
        context.validation.state === "VALID"
          ? {
              state: "ADDING_TODO",
              description: context.description,
            }
          : context,
    },
    DEFINING_EVENT: {
      DESCRIPTION_CHANGED,
      DATE_CHANGED: ({ date }, context) => ({
        ...context,
        date,
      }),
      ADD_EVENT: (_, context) =>
        context.validation.state === "VALID"
          ? {
              state: "ADDING_EVENT",
              description: context.description,
              date: context.date,
            }
          : context,
      CANCEL_DATE: (_, { description, validation }) => ({
        state: "DEFINING_TODO",
        description,
        validation,
      }),
    },
  },
  {
    ADDING_TODO: (_, prevContext) => prevContext,
    ADDING_EVENT: (_, prevContext) => prevContext,
  }
);

export const useFeature = createHook(featureContext);

export const Feature = ({
  familyId,
  userId,
  children,
  initialContext = {
    state: "DEFINING_TODO",
    description: "",
    validation: {
      state: "INVALID",
    },
  },
}: {
  familyId: string;
  userId: string;
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("GroceryList", feature);
  }

  const [context, send] = feature;

  useEnterEffect(context, "ADDING_TODO", ({ description }) => {
    storage.addTodo(familyId, description);
  });
  useEnterEffect(context, "ADDING_EVENT", ({ description, date }) => {
    storage.addEvent(familyId, userId, description, date);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
