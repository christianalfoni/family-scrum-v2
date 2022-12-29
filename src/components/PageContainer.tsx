import { Session } from "./Session";
import { firebaseContext } from "../useFirebase";
import { initializeApp } from "@firebase/app";

const app = initializeApp({
  apiKey: "AIzaSyAxghfnwp44VyGkJazhRvjUwbKSSAHm0oo",
  authDomain: "family-scrum-v2.firebaseapp.com",
  projectId: "family-scrum-v2",
  storageBucket: "family-scrum-v2.appspot.com",
  messagingSenderId: "913074889172",
  appId: "1:913074889172:web:a4b2ec5787fe31fe033641",
  measurementId: "G-HHYZ9C0PEY",
});

export const PageContainer: React.FC = ({ children }) => {
  return (
    <firebaseContext.Provider value={app}>
      <Session>{children}</Session>
    </firebaseContext.Provider>
  );
};
