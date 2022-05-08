import { Dispatch, useEffect, useReducer } from "react";
import {
  PickState,
  transition,
  TTransitions,
  useDevtools,
  useTransitionEffect,
} from "react-states";
import { EnvironmentEvent, useEnvironment } from "./environment-interface";

const actions = {
  START_CAPTURE: (videoId: string) => ({
    type: "START_CAPTURE" as const,
    videoId,
  }),
  CAPTURE: (videoId: string) => ({
    type: "CAPTURE" as const,
    videoId,
  }),
};

type Action = ReturnType<typeof actions[keyof typeof actions]>;

type BaseState = {
  ref: string;
  src: string;
  videoId: string;
};

const states = {
  LOADING: ({ ref }: Pick<BaseState, "ref">) => ({
    state: "LOADING" as const,
    ref,
  }),
  LOADED: ({ ref, src }: Pick<BaseState, "ref" | "src">) => ({
    state: "LOADED" as const,
    ref,
    src,
    START_CAPTURE: actions.START_CAPTURE,
  }),
  CAPTURED: ({ ref, src }: Pick<BaseState, "ref" | "src">) => ({
    state: "CAPTURED" as const,
    ref,
    src,
    START_CAPTURE: actions.START_CAPTURE,
  }),
  NOT_FOUND: ({ ref }: Pick<BaseState, "ref">) => ({
    state: "NOT_FOUND" as const,
    ref,
    START_CAPTURE: actions.START_CAPTURE,
  }),
  CAPTURING: ({ ref, videoId }: Pick<BaseState, "ref" | "videoId">) => ({
    state: "CAPTURING" as const,
    ref,
    videoId,
    CAPTURE: actions.CAPTURE,
  }),
};

type State = ReturnType<typeof states[keyof typeof states]>;

export const { CAPTURED, CAPTURING, LOADED, LOADING, NOT_FOUND } = states;

const START_CAPTURE = (
  state: PickState<State, "LOADED" | "NOT_FOUND" | "CAPTURED">,
  { videoId }: { videoId: string }
) =>
  CAPTURING({
    ref: state.ref,
    videoId,
  });

const transitions: TTransitions<State, Action | EnvironmentEvent> = {
  LOADING: {
    "STORAGE:FETCH_IMAGE_SUCCESS": (state, { ref, src }) =>
      state.ref === ref
        ? LOADED({
            ref,
            src,
          })
        : state,
    "STORAGE:FETCH_IMAGE_ERROR": (state, { ref }) =>
      state.ref === ref ? NOT_FOUND({ ref }) : state,
  },
  LOADED: {
    START_CAPTURE,
  },
  NOT_FOUND: {
    START_CAPTURE,
  },
  CAPTURED: {
    START_CAPTURE,
  },
  CAPTURING: {
    CAPTURE: ({ ref }, { videoId }) => CAPTURING({ ref, videoId }),
    "CAPTURE:CAPTURED": ({ ref }, { src }) => CAPTURED({ ref, src }),
  },
};

export type ImageState = State;

export type ImageAction = Action;

const reducer = (state: State, action: Action | EnvironmentEvent) =>
  transition(state, action, transitions);

export const useImage = ({
  ref,
  initialState,
}: {
  ref: string;
  initialState?: State;
}): [State, Dispatch<Action>] => {
  const { storage, capture, subscribe } = useEnvironment();
  const captureReducer = useReducer(
    reducer,
    initialState || {
      state: "LOADING",
      ref,
    }
  );

  useDevtools("Image", captureReducer);

  const [state, dispatch] = captureReducer;

  useEffect(() => subscribe(dispatch), []);

  useTransitionEffect(state, "LOADING", () => {
    storage.fetchImage(ref);
  });

  useTransitionEffect(state, "CAPTURING", ({ videoId }) => {
    capture.startCamera(videoId);
  });

  useTransitionEffect(state, "CAPTURING", "CAPTURE", ({ videoId }) => {
    capture.capture(videoId, 100, 100);
  });

  return captureReducer;
};
