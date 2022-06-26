import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";
import "firebase/storage";

import { createEmitter } from "react-environment-interface";

import { Environment, EnvironmentEvent } from "../environment-interface";
import { createAuthentication } from "./authentication/browser";
import { createCapture } from "./capture/browser";
import { createStorage } from "./storage/browser";
import { createVersion } from "./version/browser";
import { createVisibility } from "./visibility/browser";

export const createBrowserEnvironment = (): Environment => {
  const app = firebase.initializeApp({
    apiKey: "AIzaSyAxghfnwp44VyGkJazhRvjUwbKSSAHm0oo",
    authDomain: "family-scrum-v2.firebaseapp.com",
    projectId: "family-scrum-v2",
    storageBucket: "family-scrum-v2.appspot.com",
    messagingSenderId: "913074889172",
    appId: "1:913074889172:web:a4b2ec5787fe31fe033641",
    measurementId: "G-HHYZ9C0PEY",
  });

  if (process.env.NODE_ENV === "production") {
    firebase.analytics();
  }

  const { emit, subscribe } = createEmitter<EnvironmentEvent>();

  return {
    subscribe,
    authentication: createAuthentication(emit, app),
    capture: createCapture(emit),
    storage: createStorage(emit, app),
    version: createVersion(emit),
    visibility: createVisibility(emit),
  };
};
