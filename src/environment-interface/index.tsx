import { TSubscribe, createEnvironment } from "react-environment-interface";
import { Authentication, AuthenticationEvent } from "./authentication";
import { Capture, CaptureEvent } from "./capture";
import { Storage, StorageEvent } from "./storage";
import { Version, VersionEvent } from "./version";
import { Visibility, VisibilityEvent } from "./visibility";

export type EnvironmentEvent =
  | AuthenticationEvent
  | StorageEvent
  | VersionEvent
  | VisibilityEvent
  | CaptureEvent;

export type Environment = {
  authentication: Authentication;
  storage: Storage;
  version: Version;
  visibility: Visibility;
  capture: Capture;
  subscribe: TSubscribe<EnvironmentEvent>;
};

const { EnvironmentProvider, useEnvironment } =
  createEnvironment<Environment>();

export { EnvironmentProvider, useEnvironment };
