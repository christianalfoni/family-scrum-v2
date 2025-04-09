import { createContext, useContext } from "react";
import { FamilyScrumState } from "../state/FamilyScrumState";

export const FamilyScrumContext = createContext<FamilyScrumState | null>(null);

export function useFamilyScrum() {
  const familyScrum = useContext(FamilyScrumContext);

  if (!familyScrum) {
    throw new Error("useFamilyScrum must be used within a FamilyScrumProvider");
  }

  return familyScrum;
}
