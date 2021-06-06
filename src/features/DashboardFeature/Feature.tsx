import { useReducer } from "react";
import {
  createContext,
  match,
  createHook,
  createReducer,
  useEnterEffect,
  useEvents,
} from "react-states";
import { useEnvironment } from "../../environment";
import {
  BarcodeDTO,
  CalendarEventDTO,
  FamilyDTO,
  GroceryDTO,
  StorageEvent,
  TodoDTO,
  WeekDTO,
} from "../../environment/storage";
import { useSession, User } from "../SessionFeature";
import { useDevtools } from "react-states/devtools";
import { AuthenticationEvent } from "../../environment/authentication";



export type Barcodes = {
  [barcodeId: string]: BarcodeDTO;
};

export type Barcode = BarcodeDTO

export type Family = FamilyDTO;

export type { User } from "../SessionFeature";

export type Grocery = GroceryDTO;

export type Groceries = {
  [groceryId: string]: Grocery;
};

export type Todo = TodoDTO;

export type CalendarEvent = CalendarEventDTO;

export type ViewContext =
  | {
    state: "WEEKDAYS";
  }
  | {
    state: "SHOPPING_LISTS";
  }
  | {
    state: "PLAN_CURRENT_WEEK";
  }
  | {
    state: "PLAN_NEXT_WEEK";
  }
  | {
    state: "ADD_TODO";
  };

export type Todos = {
  [todoId: string]: Todo;
};

export type CalendarEvents = {
  [eventId: string]: CalendarEvent;
};

export type Week = WeekDTO;

export type WeekdayTodos = {
  [todoId: string]: string[];
};

type FamilyDataContext =
  | {
    state: "LOADING";
  }
  | {
    state: "LOADED";
    family: Family;
    groceries: Groceries;
    todos: Todos;
    events: CalendarEvents;
    barcodes: Barcodes;
  };

type WeeksDataContext =
  | {
    state: "LOADING";
  }
  | {
    state: "LOADED";
    previousWeek: Week;
    currentWeek: Week;
    nextWeek: Week;
  };

type Context =
  | {
    state: "AWAITING_AUTHENTICATION";
  }
  | {
    state: "REQUIRING_AUTHENTICATION";
  }
  | {
    state: "LOADING";
    user: User;
    familyData: FamilyDataContext;
    weeksData: WeeksDataContext;
  }
  | {
    state: "LOADED";
    family: Family;
    groceries: Groceries;
    todos: Todos;
    events: CalendarEvents;
    previousWeek: Week;
    currentWeek: Week;
    nextWeek: Week;
    view: ViewContext;
    user: User;
    barcodes: Barcodes;
  }
  | {
    state: "ERROR";
    error: string;
  };

export type UIEvent =
  | {
    type: "VIEW_SELECTED";
    view: ViewContext;
  }

  | {
    type: "GROCERY_INPUT_CHANGED";
    input: string;
  }
  | {
    type: "ADD_GROCERY";
    name: string;

  };

type Event = UIEvent | AuthenticationEvent | StorageEvent;

const featureContext = createContext<Context, UIEvent>();

export const useFeature = createHook(featureContext);

const reducer = createReducer<Context, Event>({
  AWAITING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": ({ user }) => ({
      state: "LOADING",
      familyData: {
        state: "LOADING",
      },
      weeksData: {
        state: "LOADING",
      },
      user,
    }),
    "AUTHENTICATION:UNAUTHENTICATED": () => ({
      state: "REQUIRING_AUTHENTICATION",
    }),
  },
  REQUIRING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": ({ user }) => ({
      state: "LOADING",
      familyData: {
        state: "LOADING",
      },
      weeksData: {
        state: "LOADING",
      },
      user,
    }),
  },
  LOADING: {
    "STORAGE:FETCH_FAMILY_DATA_SUCCESS": (
      { groceries, todos, family, events, barcodes },
      context
    ) =>
      match(context.weeksData, {
        LOADING: (): Context => ({
          ...context,
          familyData: {
            state: "LOADED",
            groceries,
            todos,
            family,
            events,
            barcodes,
          },
        }),
        LOADED: ({ currentWeek, nextWeek, previousWeek }): Context => ({
          state: "LOADED",
          view: {
            state: "WEEKDAYS",
          },
          user: context.user,
          currentWeek,
          nextWeek,
          previousWeek,
          groceries,
          todos,
          family,
          barcodes,
          events,
        }),
      }),
    "STORAGE:WEEKS_UPDATE": (
      { previousWeek, currentWeek, nextWeek },
      context
    ) =>
      match(context.familyData, {
        LOADING: (): Context => ({
          ...context,
          weeksData: {
            state: "LOADED",
            previousWeek,
            currentWeek,
            nextWeek,
          },
        }),
        LOADED: ({ events, family, todos, groceries, barcodes }): Context => ({
          state: "LOADED",
          view: {
            state: "WEEKDAYS",
          },
          user: context.user,
          currentWeek,
          nextWeek,
          previousWeek,
          groceries,
          todos,
          family,
          events,
          barcodes,
        }),
      }),
    "STORAGE:FETCH_WEEKS_ERROR": ({ error }) => ({
      state: "ERROR",
      error,
    }),
    "STORAGE:FETCH_FAMILY_DATA_ERROR": ({ error }) => ({
      state: "ERROR",
      error,
    }),
  },
  LOADED: {
    "STORAGE:GROCERIES_UPDATE": ({ groceries }, context) => ({
      ...context,
      groceries,
    }),
    "STORAGE:BARCODES_UPDATE": ({ barcodes }, context) => ({
      ...context,
      barcodes,
    }),
    "STORAGE:WEEKS_UPDATE": (
      { currentWeek, nextWeek, previousWeek },
      context
    ) => ({
      ...context,
      currentWeek,
      nextWeek,
      previousWeek,
    }),
    "STORAGE:TODOS_UPDATE": ({ todos }, context) => ({
      ...context,
      view:
        context.view.state === "ADD_TODO"
          ? {
            state: "WEEKDAYS",
          }
          : context.view,
      todos,
    }),
    "STORAGE:EVENTS_UPDATE": ({ events }, context) => ({
      ...context,
      view:
        context.view.state === "ADD_TODO"
          ? {
            state: "WEEKDAYS",
          }
          : context.view,
      events,
    }),
    VIEW_SELECTED: ({ view }, context) => ({
      ...context,
      view,
    }),
  },
  ERROR: {},
});

export type Props = {
  children: React.ReactNode;
  initialContext?: Context;
};

export const selectors = {

  todosByWeekday: (week: Week) => {
    const todosByWeekday: [
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos
    ] = [{}, {}, {}, {}, {}, {}, {}];

    for (let todoId in week.todos) {
      for (let userId in week.todos[todoId]) {
        week.todos[todoId][userId].forEach((isActive, index) => {
          if (isActive) {
            if (!todosByWeekday[index][todoId]) {
              todosByWeekday[index][todoId] = [];
            }
            todosByWeekday[index][todoId].push(userId);
          }
        });
      }
    }

    return todosByWeekday;
  },
  sortedEvents: (events: CalendarEvents) =>
    Object.values(events).sort((a, b) => {
      if (a.date > b.date) {
        return 1;
      } else if (a.date < b.date) {
        return -1;
      }

      return 0;
    }),
  sortedTodos: (todos: Todos) =>
    Object.values(todos).sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      } else if (a.created > b.created) {
        return -1;
      }

      return 0;
    }),

};

export const Feature = ({ children, initialContext }: Props) => {
  const { storage, authentication } = useEnvironment();
  const [session] = useSession();

  const matchSession = match(session);

  initialContext =
    initialContext ||
    matchSession<Context>({
      VERIFYING_AUTHENTICATION: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      SIGNING_IN: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      ERROR: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      NO_FAMILY: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      JOINING_FAMILY: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      CREATING_FAMILY: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      SIGNED_IN: ({ user }) => ({
        state: "LOADING",
        familyData: {
          state: "LOADING",
        },
        weeksData: {
          state: "LOADING",
        },
        user,
      }),
      SIGNED_OUT: () => ({
        state: "REQUIRING_AUTHENTICATION",
      }),
      UPDATING_VERSION: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
    });

  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("Dashboard", feature);
  }

  const [context, send] = feature;

  useEvents(authentication.events, send);
  useEvents(storage.events, send);

  useEnterEffect(context, "LOADING", ({ user }) => {
    storage.fetchFamilyData(user.familyId);
    storage.fetchWeeks(user.familyId, user.id);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
