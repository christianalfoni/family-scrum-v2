import { useEnv } from "../../environments";
import { useSignal } from "use-react-signal";

export type Awake = ReturnType<typeof useAwake>;

export function useAwake() {
  const env = useEnv();
  const [mode, setMode] = useSignal<"on" | "off">("off");

  return {
    mode,
    toggle,
  };

  function toggle() {
    if (mode.value === "off") {
      env.awake.on();
      setMode("on");
    } else {
      env.awake.off();
      setMode("off");
    }
  }
}
