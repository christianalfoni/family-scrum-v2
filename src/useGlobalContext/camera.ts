import { signal } from "impact-signal";

export type CameraState =
  | {
      status: "NOT_STARTED";
    }
  | {
      status: "STARTING";
    }
  | {
      status: "STARTED";
      stream: MediaStream;
    }
  | {
      status: "CAPTURED";
      stream: MediaStream;
      src: string;
    }
  | {
      status: "ERROR";
      error: string;
    };
export function createCamera() {
  const state = signal<CameraState>({
    status: "NOT_STARTED",
  });

  return {
    get state() {
      return state.value;
    },
    startCamera(elementId: string) {
      const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);

      if (!video) {
        state.value = {
          status: "ERROR",
          error: `The element id "${elementId}" does not match any element`,
        };
        return;
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment" } })
          .then((stream) => {
            video.srcObject = stream;
            state.value = {
              status: "STARTED",
              stream,
            };
          })
          .catch((error) => {
            state.value = {
              status: "ERROR",
              error: String(error),
            };
          });
      } else {
        state.value = {
          status: "ERROR",
          error: "Camera not supported",
        };
      }
    },
    capture(elementId: string, width: number, height: number) {
      const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);

      if (state.value.status !== "STARTED" || !video) {
        state.value = {
          status: "ERROR",
          error: "You can not capture with a non loaded camera",
        };
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
        height,
      );

      state.value.stream.getTracks().forEach((track) => {
        track.stop();
      });

      state.value = {
        status: "CAPTURED",
        stream: state.value.stream,
        src: canvas.toDataURL(),
      };
    },
  };
}
