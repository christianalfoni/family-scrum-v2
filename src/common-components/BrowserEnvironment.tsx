import React from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { EnvironmentProvider } from "../environment";
import { createAuthentication } from "../environment/authentication/browser";
import { createStorage } from "../environment/storage/browser";
import { createPreventScreenSleep } from "../environment/preventScreenSleep/browser";
import { createVersion } from "../environment/version/browser";
import { createVisibility } from "../environment/visibility/browser";

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

export default function BrowserEnvironment({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EnvironmentProvider
      environment={{
        authentication: createAuthentication(app),
        storage: createStorage(app),
        preventScreenSleep: createPreventScreenSleep(),
        version: createVersion(),
        visibility: createVisibility(),
      }}
    >
      {children}
    </EnvironmentProvider>
  );
}
