import { Emit } from "react-states";
import { Capture, CaptureEvent } from "../../environment-interface/capture";

export const createCapture = (emit: Emit<CaptureEvent>): Capture => {
  let currentStream: MediaStream;

  return {
    startCamera(elementId) {
      const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);

      if (!video) {
        emit({
          type: "CAPTURE:CAMERA_ERROR",
          error: "No video element",
        });
        return;
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment" } })
          .then((stream) => {
            console.log("STREAMING!", video);
            currentStream = video.srcObject = stream;
            video.onloadedmetadata = function (e) {
              video.play();
            };
          })
          .catch((error) => {
            emit({
              type: "CAPTURE:CAMERA_ERROR",
              error: error.message,
            });
          });
      } else {
        emit({
          type: "CAPTURE:CAMERA_ERROR",
          error: "Camera not supported",
        });
      }
    },
    capture(elementId, width, height) {
      const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);

      if (!video) {
        emit({
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

      if (currentStream) {
        currentStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      emit({
        type: "CAPTURE:CAPTURED",
        src: canvas.toDataURL(),
      });
    },
  };
};
