import { AppContext } from "./AppContext";
import { useGlobalContext } from "./useGlobalContext";

function Main() {
  return (
    <useGlobalContext.Provider>
      <AppContext />
    </useGlobalContext.Provider>
  );
}

export default Main;
