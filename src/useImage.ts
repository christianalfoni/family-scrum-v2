import { Dispatch, useEffect, useReducer } from "react";
import {
  createActions,
  createStates,
  CreateUnion,
  PickState,
  transition,
  useDevtools,
  useEnter,
  useTransition,
} from "react-states";
import { EnvironmentEvent, useEnvironment } from "./environment-interface";

const actions = createActions({
  START_CAPTURE: (videoId: string) => ({
    videoId,
  }),
  CAPTURE: (videoId: string) => ({
    videoId,
  }),
});

type Action = CreateUnion<typeof actions>;

type BaseState = {
  ref: string;
  src: string;
  videoId: string;
};

const states = createStates({
  LOADING: ({ ref }: Pick<BaseState, "ref">) => ({
    ref,
  }),
  LOADED: ({ ref, src }: Pick<BaseState, "ref" | "src">) => ({
    ref,
    src,
    START_CAPTURE: actions.START_CAPTURE,
  }),
  NOT_FOUND: ({ ref }: Pick<BaseState, "ref">) => ({
    ref,
    START_CAPTURE: actions.START_CAPTURE,
  }),
  CAPTURE_STARTED: ({ ref, videoId }: Pick<BaseState, "ref" | "videoId">) => ({
    ref,
    videoId,
    CAPTURE: actions.CAPTURE,
  }),
  CAPTURING: ({ ref, videoId }: Pick<BaseState, "ref" | "videoId">) => ({
    ref,
    videoId,
  }),
  CAPTURED: ({ ref, src }: Pick<BaseState, "ref" | "src">) => ({
    ref,
    src,
    START_CAPTURE: actions.START_CAPTURE,
  }),
});

type State = CreateUnion<typeof states>;

const START_CAPTURE = (
  state: PickState<State, "LOADED" | "NOT_FOUND" | "CAPTURED">,
  { videoId }: { videoId: string }
) =>
  states.CAPTURE_STARTED({
    ref: state.ref,
    videoId,
  });

export type ImageState = State;

export type ImageAction = Action;

const reducer = (prevState: State, action: Action | EnvironmentEvent) =>
  transition(prevState, action, {
    LOADING: {
      "STORAGE:FETCH_IMAGE_SUCCESS": (state, { ref, src }) =>
        state.ref === ref
          ? states.LOADED({
              ref,
              src,
            })
          : state,
      "STORAGE:FETCH_IMAGE_ERROR": (state, { ref }) =>
        state.ref === ref ? states.NOT_FOUND({ ref }) : state,
    },
    LOADED: {
      START_CAPTURE,
    },
    NOT_FOUND: {
      START_CAPTURE,
    },
    CAPTURE_STARTED: {
      CAPTURE: ({ ref }, { videoId }) => states.CAPTURING({ ref, videoId }),
    },
    CAPTURING: {
      "CAPTURE:CAPTURED": ({ ref }, { src }) => states.CAPTURED({ ref, src }),
    },
    CAPTURED: {
      START_CAPTURE,
    },
  });

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

  useEnter(state, "LOADING", () => {
    storage.fetchImage(ref);
  });

  useEnter(state, "CAPTURE_STARTED", ({ videoId }) => {
    capture.startCamera(videoId);
  });

  useEnter(state, "CAPTURING", ({ videoId }) => {
    capture.capture(videoId, 100, 100);
  });

  return captureReducer;
};
