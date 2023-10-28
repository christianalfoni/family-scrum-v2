import type { FirebaseApp } from "@firebase/app";

import { createContext, useContext } from "react";

export const firebaseContext = createContext(null as unknown as FirebaseApp);

export const FAMILY_DATA_COLLECTION = "familyData";
export const GROCERIES_COLLECTION = "groceries";
export const TODOS_COLLECTION = "todos";
export const CHECKLIST_ITEMS_COLLECTION = "checkListItems";
export const DINNERS_COLLECTION = "dinners";

export const useFirebase = () => useContext(firebaseContext);
