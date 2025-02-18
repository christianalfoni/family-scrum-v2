import { initializeApp } from "@firebase/app";
import { createCamera } from "./camera";
import { createFirebasePersistence } from "./firebase";
import { createFirebaseAuthentication } from "./authentication";

export type Context = ReturnType<typeof createContext>;

export const createContext = () => {
  const app = initializeApp({
    apiKey: "AIzaSyAxghfnwp44VyGkJazhRvjUwbKSSAHm0oo",
    authDomain: "family-scrum-v2.vercel.app",
    projectId: "family-scrum-v2",
    storageBucket: "family-scrum-v2.appspot.com",
    messagingSenderId: "913074889172",
    appId: "1:913074889172:web:a4b2ec5787fe31fe033641",
    measurementId: "G-HHYZ9C0PEY",
  });

  return {
    camera: createCamera(),
    authentication: createFirebaseAuthentication(app),
    persistence: createFirebasePersistence(app),
  };
};
