import React, { createContext, useContext } from "react";
import { createEmitter, TEmit, TSubscribe } from "react-states";
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
};

type EnvironmentWithEmitter = Environment & {
  emit: TEmit<EnvironmentEvent>
  subscribe: TSubscribe<EnvironmentEvent>
}

const environmentContext = createContext({} as EnvironmentWithEmitter)

export const useEnvironment = ()  => useContext(environmentContext)

export const EnvironmentProvider: React.FC<{ environment: EnvironmentWithEmitter}> = ({ environment, children }) => (
  <environmentContext.Provider value={environment}>
    {children}
  </environmentContext.Provider>
)

export const createEnvironment = (constr: (emit: TEmit<EnvironmentEvent>) => Environment) => {
  const emitter = createEmitter<EnvironmentEvent>()
  
  return {
    ...emitter,
    ...constr(emitter.emit)
  }
}