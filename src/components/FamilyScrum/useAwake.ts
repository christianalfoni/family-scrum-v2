import { useReactive } from "use-reactive-react";
import { useEnv } from "../../environments";

export type Awake = {
  mode: "off" | "on";
  toggle(): void;
};

export function useAwake() {
  const env = useEnv();
  const awake = useReactive<Awake>({
    mode: "off",
    toggle() {
      if (awake.mode === "off") {
        env.awake.on();
        awake.mode = "on";
      } else {
        env.awake.off();
        awake.mode = "off";
      }
    },
  });

  return useReactive.readonly(awake);
}
