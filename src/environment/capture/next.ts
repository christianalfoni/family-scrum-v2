import { events } from "react-states";
import { Capture } from ".";

export const createCapture = (): Capture => {
  return {
    events: events(),
    capture() {
      throw new Error("Should not be called on server");
    },
    startCamera() {
      throw new Error("Should not be called on server");
    },
  };
};
