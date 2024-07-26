import { createSignal } from "@/ratchit";
import { signal } from "impact-app";

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

export class Camera {
  #state = createSignal<CameraState>({
    status: "NOT_STARTED",
  });

  get state() {
    return this.#state.get();
  }
  startCamera(elementId: string) {
    const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);

    if (!video) {
      this.#state.set({
        status: "ERROR",
        error: `The element id "${elementId}" does not match any element`,
      });
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          video.srcObject = stream;
          this.#state.set({
            status: "STARTED",
            stream,
          });
        })
        .catch((error) => {
          this.#state.set({
            status: "ERROR",
            error: String(error),
          });
        });
    } else {
      this.#state.set({
        status: "ERROR",
        error: "Camera not supported",
      });
    }
  }
  capture(elementId: string, width: number, height: number) {
    const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);
    const state = this.#state.get();

    if (state.status !== "STARTED" || !video) {
      this.#state.set({
        status: "ERROR",
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

    this.#state.set({
      status: "CAPTURED",
      stream: state.stream,
      src: canvas.toDataURL(),
    });
  }
}
