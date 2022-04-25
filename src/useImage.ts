import { useEffect, useReducer } from "react";
import {
  $COMMAND,
  IAction,
  ICommand,
  IState,
  pick,
  PickCommand,
  PickState,
  ReturnTypes,
  transition,
  TTransitions,
  useCommandEffect,
  useDevtools,
  useStateEffect,
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

type Action = ReturnTypes<typeof actions, IAction>;

const commands = {
  CAPTURE: (videoId: string) => ({
    cmd: "CAPTURE" as const,
    videoId,
  }),
};

type Command = ReturnTypes<typeof commands, ICommand>;

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
    ...pick(actions, "START_CAPTURE"),
  }),
  CAPTURED: ({ ref, src }: Pick<BaseState, "ref" | "src">) => ({
    state: "CAPTURED" as const,
    ref,
    src,
    ...pick(actions, "START_CAPTURE"),
  }),
  NOT_FOUND: ({ ref }: Pick<BaseState, "ref">) => ({
    state: "NOT_FOUND" as const,
    ref,
    ...pick(actions, "START_CAPTURE"),
  }),
  CAPTURING: (
    { ref, videoId }: Pick<BaseState, "ref" | "videoId">,
    command?: PickCommand<Command, "CAPTURE">
  ) => ({
    state: "CAPTURING" as const,
    ref,
    videoId,
    [$COMMAND]: command,
    ...pick(actions, "CAPTURE"),
  }),
};

type State = ReturnTypes<typeof states, IState>;

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
    CAPTURE: ({ ref }, { videoId }) =>
      CAPTURING({ ref, videoId }, commands.CAPTURE(videoId)),
    "CAPTURE:CAPTURED": ({ ref }, { src }) => CAPTURED({ ref, src }),
  },
};

export type ImageState = State;

export type ImageAction = Action;

const reducer = (state: State, action: Action) =>
  transition(state, action, transitions);

export const useImage = ({
  ref,
  initialState,
}: {
  ref: string;
  initialState?: State;
}) => {
  const { storage, capture, emitter } = useEnvironment();
  const captureReducer = useReducer(
    reducer,
    initialState || {
      state: "LOADING",
      ref,
    }
  );

  useDevtools("Image", captureReducer);

  const [state, dispatch] = captureReducer;

  useEffect(() => emitter.subscribe(dispatch), []);

  useStateEffect(state, "LOADING", () => {
    storage.fetchImage(ref);
  });

  useStateEffect(state, "CAPTURING", ({ videoId }) => {
    capture.startCamera(videoId);
  });

  useCommandEffect(state, "CAPTURE", ({ videoId }) => {
    capture.capture(videoId, 100, 100);
  });

  return captureReducer;
};
