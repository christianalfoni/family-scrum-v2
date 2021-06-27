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
      state: "AWAITING_VIDEO";
    }
  | {
      state: "CAPTURING";
      videoId: string;
    };

type TransientContext =
  | {
      state: "CREATING_CAPTURE";
      videoId: string;
    }
  | {
      state: "SAVING_CAPTURE";
      src: string;
    };

type UIEvent =
  | {
      type: "START_CAPTURE";
    }
  | {
      type: "CAPTURE";
      videoId: string;
    }
  | {
      type: "VIDEO_LOADED";
      videoId: string;
    };

type Event = UIEvent | StorageEvent | CaptureEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

export const useFeature = createHook(featureContext);

const reducer = createReducer<Context, Event, TransientContext>(
  {
    AWAITING_VIDEO: {
      VIDEO_LOADED: ({ videoId }) => ({
        state: "CAPTURING",
        videoId,
      }),
    },
    CAPTURING: {
      CAPTURE: ({ videoId }) => ({
        state: "CREATING_CAPTURE",
        videoId,
      }),
      "CAPTURE:CAPTURED": ({ src }) => ({
        state: "SAVING_CAPTURE",
        src,
      }),
    },
  },
  {
    SAVING_CAPTURE: () => ({
      state: "AWAITING_VIDEO",
    }),
    CREATING_CAPTURE: (_, prevContext) => prevContext,
  }
);

export const Feature = ({
  children,
  onCapture,
  width,
  height,
  initialContext = {
    state: "AWAITING_VIDEO",
  },
}: {
  onCapture: (src: string) => void;
  width: number;
  height: number;
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

  useEnterEffect(context, "SAVING_CAPTURE", ({ src }) => {
    onCapture(src);
  });

  useEnterEffect(context, "CREATING_CAPTURE", ({ videoId }) => {
    capture.capture(videoId, width, height);
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
