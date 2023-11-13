import { context } from "impact-app";
import { useFirebase } from "./firebase";
import { useViews } from "./views";
import { useAuthentication } from "./authentication";
import { useCamera } from "./camera";
import { useVersion } from "./version";

export const useGlobalContext = context(() => {
  const firebase = useFirebase();
  const views = useViews();
  const authentication = useAuthentication(firebase);
  const camera = useCamera();
  const version = useVersion();

  return {
    views,
    firebase,
    authentication,
    camera,
    version,
  };
});
