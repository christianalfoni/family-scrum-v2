import { context } from "impact-app";
import { createFirebase } from "./firebase";
import { createViews } from "./views";
import { createSession } from "./session";

export const useGlobalContext = context(() => {
  const firebase = createFirebase();
  const views = createViews();
  const session = createSession(firebase);

  return {
    views,
    firebase,
    session,
  };
});
