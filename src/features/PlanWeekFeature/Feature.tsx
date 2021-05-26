import { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { StorageEvent } from "../../environment/storage";
import { User } from "../DashboardFeature";

type Context = {
  state: "PLANNING";
  userId: string;
};

type TransientContext = {
  state: "TOGGLING_WEEKDAY";
  taskId: string;
  weekdayIndex: number;
  active: boolean;
};

type UIEvent = {
  type: "TOGGLE_WEEKDAY";
  taskId: string;
  userId: string;
  weekdayIndex: number;
  active: boolean;
};

type Event = UIEvent | StorageEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

const reducer = createReducer<Context, Event, TransientContext>(
  {
    PLANNING: {
      TOGGLE_WEEKDAY: ({ userId, taskId, weekdayIndex, active }, context) =>
        userId === context.userId
          ? {
              state: "TOGGLING_WEEKDAY",
              taskId,
              weekdayIndex,
              active,
            }
          : context,
    },
  },
  {
    TOGGLING_WEEKDAY: (_, prevContext) => prevContext,
  }
);

export const useFeature = createHook(featureContext);

export const Feature = ({
  user,
  weekId,
  children,
  initialContext = {
    state: "PLANNING",
    userId: user.id,
  },
}: {
  user: User;
  weekId: string;
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("PlanWeek", feature);
  }

  const [context, send] = feature;

  useEnterEffect(
    context,
    "TOGGLING_WEEKDAY",
    ({ taskId, weekdayIndex, active }) => {
      storage.setWeekTaskActivity({
        familyId: user.familyId,
        weekId,
        taskId: taskId,
        userId: user.id,
        active,
        weekdayIndex,
      });
    }
  );

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
