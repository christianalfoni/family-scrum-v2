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
  startCamera(elementId: string): void;
  capture(elementId: string, width: number, height: number): void;
}
