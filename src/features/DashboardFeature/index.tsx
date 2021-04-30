import { useEffect, useReducer } from "react";
import {
  exec,
  createStatesContext,
  createStatesReducer,
  createStatesHook,
  match,
} from "react-states";
import { useEnvironment } from "../../environment";
import { GroceryDTO, TaskDTO, WeekDTO } from "../../environment/storage";
import { useAuth } from "../AuthFeature";
import { getCurrentWeekDayId } from "../../utils";
import { useDevtools } from "react-states/devtools";

export type Grocery = GroceryDTO;

export type Groceries = Grocery[];

export type Task = TaskDTO;

export type Tasks = Task[];

export type Week = WeekDTO;

type DashboardContext =
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

const AUTH_AUTHENTICATED = Symbol("AUTH_AUTHENTICATED");
const AUTH_UNAUTHENTICATED = Symbol("AUTH_UNAUTHENTICATED");
const DATA_LOAD_SUCCESS = Symbol("DATA_LOAD_SUCCESS");
const DATA_LOAD_ERROR = Symbol("DATA_LOAD_ERROR");

type DashboardEvent =
  | {
      type: typeof DATA_LOAD_SUCCESS;
      groceries: Groceries;
      tasks: Task[];
      week: Week;
    }
  | {
      type: typeof DATA_LOAD_ERROR;
      error: string;
    }
  | {
      type: typeof AUTH_AUTHENTICATED;
      familyUid: string;
    }
  | {
      type: typeof AUTH_UNAUTHENTICATED;
    };
const dashboardContext = createStatesContext<
  DashboardContext,
  DashboardEvent
>();

export const useDashboard = createStatesHook(dashboardContext);

const dashboardReducer = createStatesReducer<DashboardContext, DashboardEvent>({
  AWAITING_AUTHENTICATION: {
    [AUTH_AUTHENTICATED]: ({ familyUid }) => ({ state: "LOADING", familyUid }),
    [AUTH_UNAUTHENTICATED]: () => ({
      state: "REQUIRING_AUTHENTICATION",
    }),
  },
  REQUIRING_AUTHENTICATION: {
    [AUTH_AUTHENTICATED]: ({ familyUid }) => ({ state: "LOADING", familyUid }),
  },
  LOADING: {
    [DATA_LOAD_SUCCESS]: ({ groceries, tasks, week }, { familyUid }) => ({
      state: "LOADED",
      familyUid,
      groceries,
      tasks,
      week,
    }),
    [DATA_LOAD_ERROR]: ({ error }) => ({ state: "ERROR", error }),
  },
  LOADED: {},
  ERROR: {},
});

export type Props = {
  children: React.ReactNode;
  initialContext?: DashboardContext;
};

export const DashboardFeature = ({ children, initialContext }: Props) => {
  const { storage } = useEnvironment();
  const [auth] = useAuth();
  const matchAuth = match(auth);

  initialContext =
    initialContext ||
    matchAuth<DashboardContext>({
      VERIFYING_AUTHENTICATION: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      SIGNING_IN: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      ERROR: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      AUTHENTICATED: ({ user }) => ({
        state: "LOADING",
        familyUid: user.familyId,
      }),
      UNAUTHENTICATED: () => ({
        state: "REQUIRING_AUTHENTICATION",
      }),
    });

  const dashboardStates = useReducer(dashboardReducer, initialContext);

  if (process.browser) {
    useDevtools("Dashboard", dashboardStates);
  }

  const [dashboard, send] = dashboardStates;

  useEffect(
    () =>
      exec(auth, {
        AUTHENTICATED: ({ user }) =>
          send({ type: AUTH_AUTHENTICATED, familyUid: user.familyId }),
        UNAUTHENTICATED: () => send({ type: AUTH_UNAUTHENTICATED }),
        ERROR: () => send({ type: AUTH_UNAUTHENTICATED }),
      }),
    [auth]
  );

  useEffect(
    () =>
      exec(dashboard, {
        LOADING: ({ familyUid }) => {
          const familyStorage = storage(familyUid);
          const weekId = getCurrentWeekDayId(0);

          return familyStorage.getFamilyData(weekId).resolve(
            ({ groceries, tasks, week }) =>
              send({
                type: DATA_LOAD_SUCCESS,
                groceries,
                tasks,
                week,
              }),
            {
              ERROR: () =>
                send({
                  type: DATA_LOAD_ERROR,
                  error: "Something bad happened",
                }),
              NOT_FOUND: () =>
                send({ type: DATA_LOAD_ERROR, error: "Could not find data" }),
              NO_ACCESS: () =>
                send({
                  type: DATA_LOAD_ERROR,
                  error: "You do not have access to this data",
                }),
            }
          );
        },
      }),
    [dashboard]
  );

  return (
    <dashboardContext.Provider value={dashboardStates}>
      {children}
    </dashboardContext.Provider>
  );
};
