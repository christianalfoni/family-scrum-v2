import { App } from "./App";
import { useGlobalContext } from "./useGlobalContext";

function Main() {
  return (
    <useGlobalContext.Provider>
      <App />
    </useGlobalContext.Provider>
  );
}

export default Main;
