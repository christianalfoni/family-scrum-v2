import { createEnvironment } from "../environment-interface";
import { createAuthentication } from "./authentication/next";
import { createCapture } from "./capture/next";
import { createStorage } from "./storage/next";
import { createVersion } from "./version/next";
import { createVisibility } from "./visibility/next";

export const environment = createEnvironment(() => ({
  authentication: createAuthentication(),
  capture: createCapture(),
  storage: createStorage(),
  version: createVersion(),
  visibility: createVisibility(),
}));
