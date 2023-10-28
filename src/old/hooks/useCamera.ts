import { useState } from "react";

export type CameraState =
  | {
      state: "NOT_STARTED";
    }
  | {
      state: "STARTING";
    }
  | {
      state: "STARTED";
      stream: MediaStream;
    }
  | {
      state: "CAPTURED";
      stream: MediaStream;
      src: string;
    }
  | {
      state: "ERROR";
      error: string;
    };

export const useCamera = () => {
  const [state, setState] = useState<CameraState>({
    state: "NOT_STARTED",
  });

  return [
    state,
    {
      startCamera(elementId: string) {
        const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);

        if (!video) {
          setState({
            state: "ERROR",
            error: `The element id "${elementId}" does not match any element`,
          });
          return;
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => {
              video.srcObject = stream;
              setState({
                state: "STARTED",
                stream,
              });
            })
            .catch((error) => {
              setState({
                state: "ERROR",
                error: String(error),
              });
            });
        } else {
          setState({
            state: "ERROR",
            error: "Camera not supported",
          });
        }
      },
      capture(elementId: string, width: number, height: number) {
        const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);

        if (state.state !== "STARTED" || !video) {
          setState({
            state: "ERROR",
            error: "You can not capture with a non loaded camera",
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

        state.stream.getTracks().forEach((track) => {
          track.stop();
        });

        setState({
          state: "CAPTURED",
          stream: state.stream,
          src: canvas.toDataURL(),
        });
      },
    },
  ] as const;
};
