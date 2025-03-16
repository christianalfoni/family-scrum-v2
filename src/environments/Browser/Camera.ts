export type NOT_STARTED = {
  current: "NOT_STARTED";
  start(elementId: string): void;
};

export type STARTING = {
  current: "STARTING";
};

export type STARTED = {
  current: "STARTED";
  stream: MediaStream;
  capture(elementId: string, width: number, height: number): void;
};

export type CAPTURED = {
  current: "CAPTURED";
  stream: MediaStream;
  src: string;
};

export type ERROR = {
  current: "ERROR";
  error: string;
};

export type CameraState = NOT_STARTED | STARTING | STARTED | CAPTURED | ERROR;

export type CameraApi = {
  state: CameraState;
};

export function Camera() {
  const NOT_STARTED = (): NOT_STARTED => ({
    current: "NOT_STARTED",
    start,
  });
  const STARTING = (): STARTING => ({ current: "STARTING" });
  const STARTED = (stream: MediaStream): STARTED => ({
    current: "STARTED",
    stream,
    capture,
  });
  const CAPTURED = (stream: MediaStream, src: string): CAPTURED => ({
    current: "CAPTURED",
    stream,
    src,
  });
  const ERROR = (error: string): ERROR => ({ current: "ERROR", error });

  function start(elementId: string) {
    const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);

    if (!video) {
      camera.state = ERROR(
        `The element id "${elementId}" does not match any element`
      );
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      camera.state = STARTING();
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          video.srcObject = stream;
          camera.state = STARTED(stream);
        })
        .catch((error) => {
          camera.state = ERROR(String(error));
        });
    } else {
      camera.state = ERROR("Your browser does not support camera access");
    }
  }

  function capture(
    this: STARTED,
    elementId: string,
    width: number,
    height: number
  ) {
    const video = document.querySelector<HTMLVideoElement>(`#${elementId}`);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!video || !context) {
      camera.state = ERROR(
        `The element id "${elementId}" does not match any element`
      );
      return;
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    const src = canvas.toDataURL("image/png");

    camera.state = CAPTURED(this.stream, src);
  }

  const camera: CameraApi = {
    state: NOT_STARTED(),
  };

  return camera;
}
