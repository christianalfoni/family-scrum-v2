import { reactive } from "mobx-lite";

export function Camera() {
  const camera = reactive({
    state: NOT_STARTED() as
      | ReturnType<typeof NOT_STARTED>
      | ReturnType<typeof STARTING>
      | ReturnType<typeof STARTED>
      | ReturnType<typeof CAPTURED>
      | ReturnType<typeof ERROR>,
  });

  return camera;

  function NOT_STARTED() {
    return {
      current: "NOT_STARTED" as const,
      start,
    };
  }
  function STARTING() {
    return {
      current: "STARTING" as const,
    };
  }
  function STARTED() {
    return {
      current: "STARTED" as const,
      capture,
    };
  }
  function CAPTURED(src: string) {
    return {
      current: "CAPTURED" as const,
      src,
    };
  }
  function ERROR(error: string) {
    return {
      current: "ERROR" as const,
      error,
      start,
    };
  }

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
          camera.state = STARTED();
        })
        .catch((error) => {
          camera.state = ERROR(String(error));
        });
    } else {
      camera.state = ERROR("Your browser does not support camera access");
    }
  }

  function capture(elementId: string, width: number, height: number) {
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

    camera.state = CAPTURED(src);
  }
}
