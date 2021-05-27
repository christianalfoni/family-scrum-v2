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

type TransientContext =
  | {
      state: "TOGGLING_WEEKDAY";
      todoId: string;
      weekdayIndex: number;
      active: boolean;
    }
  | {
      state: "ARCHIVING_TODO";
      todoId: string;
    }
  | {
      state: "ARCHIVING_EVENT";
      eventId: string;
    }
  | {
      state: "TOGGLING_EVENT";
      eventId: string;
    };

type UIEvent =
  | {
      type: "TOGGLE_WEEKDAY";
      todoId: string;
      userId: string;
      weekdayIndex: number;
      active: boolean;
    }
  | {
      type: "ARCHIVE_TODO";
      todoId: string;
    }
  | {
      type: "ARCHIVE_EVENT";
      eventId: string;
    }
  | {
      type: "TOGGLE_EVENT";
      eventId: string;
    };

type Event = UIEvent | StorageEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

const reducer = createReducer<Context, Event, TransientContext>(
  {
    PLANNING: {
      TOGGLE_WEEKDAY: ({ userId, todoId, weekdayIndex, active }, context) =>
        userId === context.userId
          ? {
              state: "TOGGLING_WEEKDAY",
              todoId,
              weekdayIndex,
              active,
            }
          : context,
      ARCHIVE_TODO: ({ todoId }) => ({
        state: "ARCHIVING_TODO",
        todoId,
      }),
      ARCHIVE_EVENT: ({ eventId }) => ({
        state: "ARCHIVING_EVENT",
        eventId,
      }),
      TOGGLE_EVENT: ({ eventId }) => ({
        state: "TOGGLING_EVENT",
        eventId,
      }),
    },
  },
  {
    TOGGLING_WEEKDAY: (_, prevContext) => prevContext,
    ARCHIVING_TODO: (_, prevContext) => prevContext,
    ARCHIVING_EVENT: (_, prevContext) => prevContext,
    TOGGLING_EVENT: (_, prevContext) => prevContext,
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
    ({ todoId, weekdayIndex, active }) => {
      storage.setWeekTaskActivity({
        familyId: user.familyId,
        weekId,
        todoId,
        userId: user.id,
        active,
        weekdayIndex,
      });
    }
  );

  useEnterEffect(context, "ARCHIVING_TODO", ({ todoId }) => {
    storage.archiveTodo(user.familyId, todoId);
  });

  useEnterEffect(context, "ARCHIVING_EVENT", ({ eventId }) => {
    storage.archiveEvent(user.familyId, eventId);
  });

  useEnterEffect(context, "TOGGLING_EVENT", ({ eventId }) => {
    storage.toggleEventParticipation(user.familyId, eventId, user.id);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
