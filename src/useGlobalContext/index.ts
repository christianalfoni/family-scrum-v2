import { context } from "impact-context";
import { createFirebase } from "./firebase";
import { createViews } from "./views";
import { createAuthentication } from "./authentication";
import { createCamera } from "./camera";

export const useGlobalContext = context(() => {
  const firebase = createFirebase();
  const views = createViews();
  const authentication = createAuthentication(firebase);
  const camera = createCamera();

  return {
    views,
    firebase,
    authentication,
    camera,
  };
});
