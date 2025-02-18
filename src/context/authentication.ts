import { FirebaseApp } from "@firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  useDeviceLanguage,
} from "firebase/auth";

export function createFirebaseAuthentication(app: FirebaseApp) {
  const provider = new GoogleAuthProvider();
  const auth = getAuth(app);

  useDeviceLanguage(auth);

  return {
    onChanged: onAuthStateChanged.bind(null, auth),
    signIn() {
      if (process.env.NODE_ENV === "development") {
        signInWithPopup(auth, provider);
      } else {
        signInWithRedirect(auth, provider);
      }
    },
  };
}
