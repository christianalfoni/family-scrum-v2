import {
  getAuth,
  GoogleAuthProvider,
  useDeviceLanguage,
  signInWithRedirect,
} from "firebase/auth";

import { useFirebase } from "../useFirebase";

const provider = new GoogleAuthProvider();

export const useSignIn = () => {
  const app = useFirebase();
  const auth = getAuth(app);

  useDeviceLanguage(auth);

  return () => {
    signInWithRedirect(auth, provider);
  };
};
