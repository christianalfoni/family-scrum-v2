import { getAuth, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

import { useFirebase } from "./useFirebase";

const provider = new GoogleAuthProvider();

export const useSignIn = () => {
  const app = useFirebase();
  const auth = getAuth(app);

  return () => {
    signInWithRedirect(auth, provider);
  };
};
