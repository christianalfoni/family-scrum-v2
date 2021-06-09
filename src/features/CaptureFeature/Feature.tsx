import { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
  useEvents,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { CaptureEvent } from "../../environment/capture";
import { StorageEvent } from "../../environment/storage";

type Context =
  | {
      state: "IDLE";
    }
  | {
      state: "AWAITING_VIDEO";
      groceryId: string;
    }
  | {
      state: "CAPTURING";
      groceryId: string;
      videoId: string;
    };

type TransientContext =
  | {
      state: "CREATING_CAPTURE";
      id: string;
    }
  | {
      state: "SAVING_CAPTURE";
      src: string;
      groceryId: string;
    };

type UIEvent =
  | {
      type: "START_CAPTURE";
      groceryId: string;
    }
  | {
      type: "CAPTURE";
      id: string;
    }
  | {
      type: "VIDEO_LOADED";
      id: string;
    };

type Event = UIEvent | StorageEvent | CaptureEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

export const useFeature = createHook(featureContext);

const reducer = createReducer<Context, Event, TransientContext>(
  {
    IDLE: {
      START_CAPTURE: ({ groceryId }) => ({
        state: "AWAITING_VIDEO",
        groceryId,
      }),
    },
    AWAITING_VIDEO: {
      VIDEO_LOADED: ({ id }, { groceryId }) => ({
        state: "CAPTURING",
        groceryId,
        videoId: id,
      }),
    },
    CAPTURING: {
      CAPTURE: ({ id }) => ({
        state: "CREATING_CAPTURE",
        id,
      }),
      "CAPTURE:CAPTURED": ({ src }, { groceryId }) => ({
        state: "SAVING_CAPTURE",
        src,
        groceryId,
      }),
    },
  },
  {
    SAVING_CAPTURE: () => ({
      state: "IDLE",
    }),
    CREATING_CAPTURE: (_, prevContext) => prevContext,
  }
);

export const Feature = ({
  familyId,
  children,
  initialContext = {
    state: "IDLE",
  },
}: {
  familyId: string;
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const { storage, capture } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("Capture", feature);
  }

  const [context, send] = feature;

  useEvents(storage.events, send);
  useEvents(capture.events, send);

  useEnterEffect(context, "SAVING_CAPTURE", ({ src, groceryId }) => {
    storage.addImageToGrocery(familyId, groceryId, src);
  });

  useEnterEffect(context, "CREATING_CAPTURE", ({ id }) => {
    capture.capture(id, 128, 128);
  });

  useEnterEffect(context, "CAPTURING", ({ videoId }) => {
    capture.startCamera(videoId);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
