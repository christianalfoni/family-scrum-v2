import { createEmitter } from "react-environment-interface";
import { Environment, EnvironmentEvent } from "../environment-interface";
import { createAuthentication } from "./authentication/next";
import { createCapture } from "./capture/next";
import { createStorage } from "./storage/next";
import { createVersion } from "./version/next";
import { createVisibility } from "./visibility/next";

export const createNextEnvironment = (): Environment => {
  const { subscribe } = createEmitter<EnvironmentEvent>();
  return {
    subscribe,
    authentication: createAuthentication(),
    capture: createCapture(),
    storage: createStorage(),
    version: createVersion(),
    visibility: createVisibility(),
  };
};
