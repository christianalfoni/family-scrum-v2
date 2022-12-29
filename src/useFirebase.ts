import type { FirebaseApp } from "@firebase/app";
import { createContext, useContext } from "react";

export const firebaseContext = createContext(null as unknown as FirebaseApp);

export const useFirebase = () => useContext(firebaseContext);
