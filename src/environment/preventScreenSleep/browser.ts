import NoSleep from "nosleep.js";
import { PreventScreenSleep } from ".";

export const noSleep = new NoSleep();

export const createPreventScreenSleep = (): PreventScreenSleep => ({
  enable() {
    try {
      noSleep.enable();
    } catch {
      console.error("Not able to prevent screen sleep");
    }
  },
  disable() {
    noSleep.disable();
  },
});
