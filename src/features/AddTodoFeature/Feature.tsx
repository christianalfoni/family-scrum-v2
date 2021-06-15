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
      items: string[];
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

type TransientContext = {
  state: "ADDING_TODO";
  description: string;
  date?: number;
  time?: string;
  checkList?: string[];
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
      title: string;
    }
  | {
      type: "CHECKLIST_ITEM_REMOVED";
      index: number;
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
  description,
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

const TIME_TOGGLED = (_: any, context: Context): Context => ({
  ...context,
  time:
    context.time.state === "ACTIVE"
      ? {
          state: "INACTIVE",
        }
      : {
          state: "ACTIVE",
          time: "10:00",
        },
});

const TIME_CHANGED = (
  { time }: { time: string },
  context: Context
): Context => ({
  ...context,
  time:
    context.time.state === "ACTIVE"
      ? {
          ...context.time,
          time,
        }
      : context.time,
});

const CHECKLIST_TOGGLED = (_: any, context: Context): Context => ({
  ...context,
  checkList:
    context.checkList.state === "ACTIVE"
      ? {
          state: "INACTIVE",
        }
      : {
          state: "ACTIVE",
          items: [],
        },
});

const CHECKLIST_ITEM_ADDED = (
  { title }: { title: string },
  context: Context
): Context => ({
  ...context,
  checkList:
    context.checkList.state === "ACTIVE"
      ? {
          state: "ACTIVE",
          items: [...context.checkList.items, title],
        }
      : context.checkList,
});

const CHECKLIST_ITEM_REMOVED = (
  { index }: { index: number },
  context: Context
): Context => ({
  ...context,
  checkList:
    context.checkList.state === "ACTIVE"
      ? {
          state: "ACTIVE",
          items: [
            ...context.checkList.items.slice(0, index),
            ...context.checkList.items.slice(index + 1),
          ],
        }
      : context.checkList,
});

const reducer = createReducer<Context, Event, TransientContext>(
  {
    INVALID: {
      DESCRIPTION_CHANGED,
      DATE_TOGGLED,
      DATE_CHANGED,
      TIME_TOGGLED,
      TIME_CHANGED,
      CHECKLIST_TOGGLED,
      CHECKLIST_ITEM_ADDED,
      CHECKLIST_ITEM_REMOVED,
    },
    VALID: {
      DESCRIPTION_CHANGED,
      DATE_TOGGLED,
      DATE_CHANGED,
      TIME_TOGGLED,
      TIME_CHANGED,
      CHECKLIST_TOGGLED,
      CHECKLIST_ITEM_ADDED,
      CHECKLIST_ITEM_REMOVED,
      ADD_TODO: (_, context) => ({
        state: "ADDING_TODO",
        description: context.description,
        checkList:
          context.checkList.state === "ACTIVE"
            ? context.checkList.items
            : undefined,
        date: context.date.state === "ACTIVE" ? context.date.date : undefined,
        time: context.time.state === "ACTIVE" ? context.time.time : undefined,
      }),
    },
  },
  {
    ADDING_TODO: (_, prevContext) => prevContext,
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

  useEnterEffect(
    context,
    "ADDING_TODO",
    ({ description, date, time, checkList }) => {
      storage.addTodo(familyId, description, {
        date,
        time,
        checkList,
      });
    }
  );

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
