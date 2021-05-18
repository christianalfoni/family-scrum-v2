import { useEffect, useReducer } from "react";
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
  CalendarEventDTO,
  FamilyDTO,
  GroceryDTO,
  StorageEvent,
  TaskDTO,
  WeekDTO,
} from "../../environment/storage";
import { useSession } from "../SessionFeature";
import { getCurrentWeekDayId } from "../../utils";
import { useDevtools } from "react-states/devtools";
import { AuthenticationEvent } from "../../environment/authentication";

export type Family = FamilyDTO;

export type Grocery = GroceryDTO;

export type Groceries = Grocery[];

export type Task = TaskDTO;

export type CalendarEvent = CalendarEventDTO;

export type Tasks = {
  [taskId: string]: Task;
};

export type CalendarEvents = {
  [eventId: string]: CalendarEvent;
};

export type Week = WeekDTO;

export type WeekdayTasks = {
  [taskId: string]: string[];
};

export type ContentContext =
  | {
      state: "WEEKDAYS";
    }
  | {
      state: "GROCERIES";
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
      familyUid: string;
    }
  | {
      state: "ERROR";
      error: string;
    }
  | {
      state: "LOADED";
      content: ContentContext;
      family: Family;
      groceries: Groceries;
      tasks: Tasks;
      week: Week;
      events: CalendarEvents;
    };

export type UIEvent =
  | {
      type: "WEEKDAYS_SELECTED";
    }
  | {
      type: "GROCERIES_SELECTED";
    };

type Event = UIEvent | AuthenticationEvent | StorageEvent;

const featureContext = createContext<Context, UIEvent>();

export const useFeature = createHook(featureContext);

const reducer = createReducer<Context, Event>({
  AWAITING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED": ({ user }) => ({
      state: "LOADING",
      familyUid: user.familyId,
    }),
    "AUTHENTICATION:UNAUTHENTICATED": () => ({
      state: "REQUIRING_AUTHENTICATION",
    }),
  },
  REQUIRING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED": ({ user }) => ({
      state: "LOADING",
      familyUid: user.familyId,
    }),
  },
  LOADING: {
    "STORAGE:FETCH_FAMILY_DATA_SUCCESS": (
      { groceries, tasks, week, family, events },
      { familyUid }
    ) => ({
      state: "LOADED",
      content: {
        state: "WEEKDAYS",
      },
      familyUid,
      groceries,
      tasks,
      week,
      family,
      events,
    }),
    "STORAGE:FETCH_FAMILY_DATA_ERROR": ({ error }) => ({
      state: "ERROR",
      error,
    }),
  },
  LOADED: {
    WEEKDAYS_SELECTED: (_, context) => ({
      ...context,
      content: {
        state: "WEEKDAYS",
      },
    }),
    GROCERIES_SELECTED: (_, context) => ({
      ...context,
      content: {
        state: "GROCERIES",
      },
    }),
  },
  ERROR: {},
});

export type Props = {
  children: React.ReactNode;
  initialContext?: Context;
};

export const selectors = {
  groceriesByCategory: (groceries: Groceries) => {
    return groceries.sort((a, b) => {
      if (a.category > b.category) {
        return 1;
      } else if (a.category < b.category) {
        return -1;
      }

      return 0;
    });
  },
  tasksByWeekday: (week: Week) => {
    const tasksByWeekday: [
      WeekdayTasks,
      WeekdayTasks,
      WeekdayTasks,
      WeekdayTasks,
      WeekdayTasks,
      WeekdayTasks,
      WeekdayTasks
    ] = [{}, {}, {}, {}, {}, {}, {}];

    for (let taskId in week.tasks) {
      for (let userId in week.tasks[taskId]) {
        week.tasks[taskId][userId].forEach((isActive, index) => {
          if (isActive) {
            if (!tasksByWeekday[index][taskId]) {
              tasksByWeekday[index][taskId] = [];
            }
            tasksByWeekday[index][taskId].push(userId);
          }
        });
      }
    }

    return tasksByWeekday;
  },
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
      SIGNED_IN: ({ user }) => ({
        state: "LOADING",
        familyUid: user.familyId,
      }),
      SIGNED_OUT: () => ({
        state: "REQUIRING_AUTHENTICATION",
      }),
    });

  const feature = useReducer(reducer, initialContext);

  if (process.browser) {
    useDevtools("Dashboard", feature);
  }

  const [context, send] = feature;

  useEvents(authentication.events, send);
  useEvents(storage.events, send);

  useEnterEffect(context, "LOADING", ({ familyUid }) => {
    const weekId = getCurrentWeekDayId(0);

    storage.fetchFamilyData(familyUid, weekId);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
