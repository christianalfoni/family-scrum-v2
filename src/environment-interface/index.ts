import { defineEnvironment } from "react-states";
import { Authentication, AuthenticationEvent } from "./authentication";
import { Capture, CaptureEvent } from "./capture";
import { Storage, StorageEvent } from "./storage";
import { Version, VersionEvent } from "./version";
import { Visibility, VisibilityEvent } from "./visibility";

type EnvironmentEvent = AuthenticationEvent | StorageEvent | VersionEvent | VisibilityEvent | CaptureEvent

export interface Environment {
    authentication: Authentication;
    storage: Storage;
    version: Version;
    visibility: Visibility
    capture: Capture;
  }

const {
    EnvironmentProvider,
    createEnvironment,
    createReducer,
    useEnvironment,
    useReducer
} = defineEnvironment<Environment, EnvironmentEvent>()

export {
    EnvironmentProvider,
    createEnvironment,
    createReducer,
    useEnvironment,
    useReducer  
}