import { StatesReducer, useCommandEffect, useStateEffect } from "react-states";
import {
  createReducer,
  createReducerHandlers,
  useEnvironment,
  useReducer,
} from "./environment-interface";

type BaseState = {
  ref: string;
};

type State = BaseState &
  (
    | {
        state: "LOADING";
      }
    | {
        state: "LOADED";
        src: string;
      }
    | {
        state: "CAPTURED";
        src: string;
      }
    | {
        state: "NOT_FOUND";
      }
    | {
        state: "CAPTURING";
        videoId: string;
      }
  );

type Action =
  | {
      type: "START_CAPTURE";
      videoId: string;
    }
  | {
      type: "CAPTURE";
      videoId: string;
    };

type ImageReducer = StatesReducer<State, Action>;

const captureHandler = createReducerHandlers<
  ImageReducer,
  "LOADED" | "NOT_FOUND" | "CAPTURED"
>({
  START_CAPTURE: ({ state, action: { videoId }, transition }) =>
    transition(
      {
        ...state,
        state: "CAPTURING",
        videoId,
      },
      {
        cmd: "$CALL_ENVIRONMENT",
        target: "capture.startCamera",
        params: [videoId],
      }
    ),
});

const reducer = createReducer<ImageReducer>({
  LOADING: {
    "STORAGE:FETCH_IMAGE_SUCCESS": ({
      state,
      action: { ref, src },
      transition,
      noop,
    }) =>
      state.ref === ref
        ? transition({
            ...state,
            state: "LOADED",
            src,
          })
        : noop(),
    "STORAGE:FETCH_IMAGE_ERROR": ({
      state,
      action: { ref },
      transition,
      noop,
    }) =>
      state.ref === ref
        ? transition({
            ...state,
            state: "NOT_FOUND",
          })
        : noop(),
  },
  LOADED: {
    ...captureHandler,
  },
  NOT_FOUND: {
    ...captureHandler,
  },
  CAPTURED: {
    ...captureHandler,
  },
  CAPTURING: {
    CAPTURE: ({ state, action: { videoId }, transition }) =>
      transition(
        {
          ...state,
          videoId,
        },
        {
          cmd: "$CALL_ENVIRONMENT",
          target: "capture.capture",
          params: [videoId, 100, 100],
        }
      ),
    "CAPTURE:CAPTURED": ({ state, action: { src }, transition }) =>
      transition({
        ...state,
        state: "CAPTURED",
        src,
      }),
  },
});

export const useImage = ({
  ref,
  initialState,
}: {
  ref: string;
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const captureReducer = useReducer(
    "Image",
    reducer,
    initialState || {
      state: "LOADING",
      ref,
    }
  );
  const [state] = captureReducer;

  useStateEffect(state, "LOADING", () => {
    storage.fetchImage(ref);
  });

  return captureReducer;
};
