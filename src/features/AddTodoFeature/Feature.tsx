import { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";

type DateContext =
  | {
      state: "INACTIVE";
    }
  | {
      state: "ACTIVE";
      date: number;
    };

type TimeContext =
  | {
      state: "INACTIVE";
    }
  | {
      state: "ACTIVE";
      time: string;
    };

type ChecklistContext =
  | {
      state: "INACTIVE";
    }
  | {
      state: "ACTIVE";
      items: Array<{ title: string; completed: boolean }>;
    };

type BaseContext = {
  description: string;
  date: DateContext;
  time: TimeContext;
  checkList: ChecklistContext;
};

type Context = BaseContext &
  (
    | {
        state: "VALID";
      }
    | {
        state: "INVALID";
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
      type: "DATE_TOGGLED";
    }
  | {
      type: "DATE_CHANGED";
      date: number;
    }
  | {
      type: "TIME_TOGGLED";
    }
  | {
      type: "TIME_CHANGED";
      time: string;
    }
  | {
      type: "CHECKLIST_TOGGLED";
    }
  | {
      type: "CHECKLIST_ITEM_ADDED";
      description: string;
    }
  | {
      type: "ADD_TODO";
    };

type Event = UIEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

const DESCRIPTION_CHANGED = (
  { description }: { description: string },
  context: Context
): Context => ({
  ...context,
  state: description ? "VALID" : "INVALID",
});

const DATE_TOGGLED = (_: any, context: Context): Context => ({
  ...context,
  date:
    context.date.state === "ACTIVE"
      ? {
          state: "INACTIVE",
        }
      : {
          state: "ACTIVE",
          date: Date.now(),
        },
});

const DATE_CHANGED = (
  { date }: { date: number },
  context: Context
): Context => ({
  ...context,
  date:
    context.date.state === "ACTIVE"
      ? {
          ...context.date,
          date,
        }
      : context.date,
});

const reducer = createReducer<Context, Event, TransientContext>(
  {
    INVALID: {
      DESCRIPTION_CHANGED,
      DATE_TOGGLED,
      DATE_CHANGED,
    },
    VALID: {
      DESCRIPTION_CHANGED,
      DATE_TOGGLED,
      DATE_CHANGED,
      ADD_TODO: (_, context) => ({
        state: "ADDING_TODO",
        description: context.description,
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
    state: "INVALID",
    description: "",
    checkList: {
      state: "INACTIVE",
    },
    date: {
      state: "INACTIVE",
    },
    time: {
      state: "INACTIVE",
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
