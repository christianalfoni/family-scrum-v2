import { AppView } from "./AppView";
import { useGlobalStore } from "./stores/GlobalStore";

function Main() {
  return (
    <useGlobalStore.Provider>
      <AppView />
    </useGlobalStore.Provider>
  );
}

export default Main;
