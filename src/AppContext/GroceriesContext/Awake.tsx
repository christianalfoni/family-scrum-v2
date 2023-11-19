import React, { useEffect, useState } from "react";
import { LightBulbIcon } from "@heroicons/react/outline";
import { LightBulbIcon as SolidLightBulbIcon } from "@heroicons/react/solid";

import { mp4 } from "../../video";

export const Awake = () => {
  const [isAwake, setIsAweake] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const videoUpdateCallback = React.useCallback(() => {
    const video = videoRef.current!;

    if (video.currentTime > 0.5) {
      video.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current!;

    if (isAwake) {
      video.play();
      video.addEventListener("timeupdate", videoUpdateCallback);

      return () => {
        video.removeEventListener("timeupdate", videoUpdateCallback);
      };
    } else {
      videoRef.current?.pause();
    }
  }, [isAwake]);

  return (
    <div className="relative mx-auto inline-flex items-center justify-center border border-transparent text-sm font-medium rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
      {isAwake ? (
        <SolidLightBulbIcon className="w-6 h-6 text-yellow-500" />
      ) : (
        <LightBulbIcon className="w-6 h-6" />
      )}
      <video
        ref={videoRef}
        className="absolute left-0 right-0 bottom-0 top-0 opacity-0"
        onClick={() => {
          setIsAweake((current) => !current);
        }}
        src={mp4}
        playsInline
        disablePictureInPicture
      ></video>
    </div>
  );
};
