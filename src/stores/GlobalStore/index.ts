import { useFirebase } from "./firebase";
import { useViews } from "./views";
import { useAuthentication } from "./authentication";
import { useCamera } from "./camera";
import { useVersion } from "./version";
import { createStore } from "@impact-react/signals";

function GlobalStore() {
  // We compose the global context using the hooks pattern
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
}

export const useGlobalStore = createStore(GlobalStore);
