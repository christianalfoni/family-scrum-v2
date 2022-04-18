import { Capture } from "../../environment-interface/capture";

export const createCapture = (): Capture => {
  return {
    capture() {
      throw new Error("Should not be called on server");
    },
    startCamera() {
      throw new Error("Should not be called on server");
    },
  };
};
