import { events } from "react-states";
import { Capture } from ".";

export const createCapture = (): Capture => ({
  events: events(),
  startCamera(elementId) {
    const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);

    if (!video) {
      this.events.emit({
        type: "CAPTURE:CAMERA_ERROR",
        error: "No video element",
      });
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
        })
        .catch((error) => {
          this.events.emit({
            type: "CAPTURE:CAMERA_ERROR",
            error: error.message,
          });
        });
    } else {
      this.events.emit({
        type: "CAPTURE:CAMERA_ERROR",
        error: "Camera not supported",
      });
    }
  },
  capture(elementId, width, height) {
    const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);

    if (!video) {
      this.events.emit({
        type: "CAPTURE:CAMERA_ERROR",
        error: "No video element",
      });
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;

    canvas.width = width;
    canvas.height = height;

    // 640 * 480
    const size = Math.min(video.videoHeight, video.videoWidth);
    const widthOffset = (video.videoWidth - size) / 2;
    const heightOffset = (video.videoHeight - size) / 2;

    context.drawImage(
      video,
      widthOffset,
      heightOffset,
      size,
      size,
      0,
      0,
      width,
      height
    );

    this.events.emit({
      type: "CAPTURE:CAPTURED",
      src: canvas.toDataURL(),
    });
  },
});
