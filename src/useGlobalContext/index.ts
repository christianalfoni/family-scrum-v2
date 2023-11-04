import { context } from "impact-context";
import { createFirebase } from "./firebase";
import { createViews } from "./views";
import { createAuthentication } from "./authentication";

export const useGlobalContext = context(() => {
  const firebase = createFirebase();
  const views = createViews();
  const authentication = createAuthentication(firebase);

  return {
    views,
    firebase,
    authentication,
  };
});
