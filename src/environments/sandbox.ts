import { createEnvironment } from "../environment-interface";
import { createAuthentication } from "./authentication/sandbox";
import { createCapture } from "./capture/sandbox";
import { createStorage } from "./storage/sandbox";
import { createVersion } from "./version/sandbox";
import { createVisibility } from "./visibility/sandbox";

export const environment = createEnvironment((emit) => ({
  authentication: createAuthentication(emit),
  capture: createCapture(emit),
  storage: createStorage(emit),
  version: createVersion(emit, "1.0.0", "1.0.0"),
  visibility: createVisibility(),
}));
