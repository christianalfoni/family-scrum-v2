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
  GroceryDTO,
  StorageEvent,
  TaskDTO,
  WeekDTO,
} from "../../environment/storage";
import { useSession } from "../SessionFeature";
import { getCurrentWeekDayId } from "../../utils";
import { useDevtools } from "react-states/devtools";
import { AuthenticationEvent } from "../../environment/authentication";

export type Grocery = GroceryDTO;

export type Groceries = Grocery[];

export type Task = TaskDTO;

export type Tasks = Task[];

export type Week = WeekDTO;

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
      state: "LOADED";
      familyUid: string;
      groceries: Groceries;
      tasks: Task[];
      week: Week;
    }
  | {
      state: "ERROR";
      error: string;
    };

type Event = AuthenticationEvent | StorageEvent;

const featureContext = createContext<Context, never>();

export const useFeature = createHook(featureContext);

const reducer = createReducer<Context, Event>({
  AWAITING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED": ({ user }): Context => ({
      state: "LOADING",
      familyUid: user.familyId,
    }),
    "AUTHENTICATION:UNAUTHENTICATED": (): Context => ({
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
      { groceries, tasks, week },
      { familyUid }
    ): Context => ({
      state: "LOADED",
      familyUid,
      groceries,
      tasks,
      week,
    }),
    "STORAGE:FETCH_FAMILY_DATA_ERROR": ({ error }): Context => ({
      state: "ERROR",
      error,
    }),
  },
  LOADED: {},
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
