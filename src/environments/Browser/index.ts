import { initializeApp } from "@firebase/app";
import { Camera } from "./Camera";
import { Authentication } from "./Authentication";
import { Persistence } from "./Persistence";
import { Awake } from "./Awake";

export type BrowserEnvironment = ReturnType<typeof BrowserEnvironment>;

export function BrowserEnvironment() {
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
    camera: Camera(),
    authentication: Authentication(app),
    persistence: Persistence(app),
    awake: Awake(),
  };
}
