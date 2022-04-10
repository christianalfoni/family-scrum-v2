import { createContext, useContext } from "react";
import {
  States,
  StatesTransition,
  useCommandEffect,
  useStateEffect,
} from "react-states";
import {
  createReducer,
  useEnvironment,
  useReducer,
} from "../../environment-interface";

type State =
  | {
      state: "AWAITING_VIDEO";
    }
  | {
      state: "CAPTURING";
      videoId: string;
    };

type Action =
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

type Command =
  | {
      cmd: "CREATE_CAPTURE";
      videoId: string;
    }
  | {
      cmd: "SAVE_CAPTURE";
      src: string;
    };

type CaptureFeature = States<State, Action, Command>;

type Transition = StatesTransition<CaptureFeature>;

const featureContext = createContext({} as CaptureFeature);

export const useFeature = () => useContext(featureContext);

const reducer = createReducer<CaptureFeature>({
  AWAITING_VIDEO: {
    VIDEO_LOADED: (_, { videoId }) => ({
      state: "CAPTURING",
      videoId,
    }),
  },
  CAPTURING: {
    CAPTURE: (state, { videoId }): Transition => [
      {
        ...state,
        videoId,
      },
      {
        cmd: "CREATE_CAPTURE",
        videoId,
      },
    ],
    "CAPTURE:CAPTURED": (_, { src }): Transition => [
      {
        state: "AWAITING_VIDEO",
      },
      {
        cmd: "SAVE_CAPTURE",
        src,
      },
    ],
  },
});

export const Feature = ({
  children,
  onCapture,
  width,
  height,
  initialState = {
    state: "AWAITING_VIDEO",
  },
}: {
  onCapture: (src: string) => void;
  width: number;
  height: number;
  children: React.ReactNode;
  initialState?: State;
}) => {
  const { capture } = useEnvironment();
  const feature = useReducer("Capture", reducer, initialState);
  const [state] = feature;

  useCommandEffect(state, "SAVE_CAPTURE", ({ src }) => {
    onCapture(src);
  });

  useCommandEffect(state, "CREATE_CAPTURE", ({ videoId }) => {
    capture.capture(videoId, width, height);
  });

  useStateEffect(state, "CAPTURING", ({ videoId }) => {
    capture.startCamera(videoId);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
