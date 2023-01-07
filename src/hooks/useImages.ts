import { getStorage, getDownloadURL, ref } from "firebase/storage";
import { useCache } from "../useCache";
import { useFirebase } from "../useFirebase";

export type Images = Record<string, string>;

export const useImages = () => useCache<Images>("images", {});

export const useFetchImage = () => {
  const app = useFirebase();
  const storage = getStorage(app);
  const imagesCache = useImages();

  return async (imageRef: string) => {
    const images = imagesCache.read();

    if (images.data[imageRef]) {
      return images.data[imageRef];
    }

    const storageRef = ref(storage, imageRef + ".png");
    const src = await getDownloadURL(storageRef);

    imagesCache.write((current) => ({
      ...current,
      [imageRef]: src,
    }));
  };
};
