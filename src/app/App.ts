import { signal } from "impact-react";
import { detectNewVersion } from "./version";
import { createCamera } from "./createCamera";
import { createFirebase } from "./firebase";
import { createAuthentication } from "./authentication";

export function createApp() {
  const firebase = createFirebase();
  const authentication = createAuthentication(firebase);
  const hasNewVersion = signal(detectNewVersion());
  const camera = createCamera();

  return {
    get hasNewVersion() {
      return hasNewVersion();
    },
  };
}
