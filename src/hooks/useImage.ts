import { getStorage, getDownloadURL, ref } from "firebase/storage";
import { useCache } from "../useCache";
import { useFirebase } from "../useFirebase";

export const useImage = (imageRef: string) => {
  const app = useFirebase();
  const storage = getStorage(app);

  return useCache<string>(`image-${ref}`, () => {
    const storageRef = ref(storage, imageRef + ".png");

    return getDownloadURL(storageRef);
  });
};
