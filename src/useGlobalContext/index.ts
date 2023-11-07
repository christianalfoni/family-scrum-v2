import { context } from "impact-context";
import { createFirebase } from "./firebase";
import { createViews } from "./views";
import { createAuthentication } from "./authentication";
import { createCamera } from "./camera";
import { createVersion } from "./version";

export const useGlobalContext = context(() => {
  const firebase = createFirebase();
  const views = createViews();
  const authentication = createAuthentication(firebase);
  const camera = createCamera();
  const version = createVersion();

  return {
    views,
    firebase,
    authentication,
    camera,
    version,
  };
});
