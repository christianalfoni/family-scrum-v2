import { Events } from "react-states";

export type CaptureEvent =
  | {
      type: "CAPTURE:CAPTURED";
      src: string;
    }
  | {
      type: "CAPTURE:CAMERA_ERROR";
      error: string;
    };

export interface Capture {
  events: Events<CaptureEvent>;
  startCamera(elementId: string): void;
  capture(elementId: string, width: number, height: number): void;
}
