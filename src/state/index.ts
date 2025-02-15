import { apis } from "../apis";
import { createSession } from "./session";

const session = createSession(apis);

export const useSession = () => session;

export function useFamilyScrum() {
  if (session.state.current !== "AUTHENTICATED") {
    throw new Error("You are not authenticated");
  }

  return session.state.familyScrum;
}

export function useDashboard() {
  const familyScrum = useFamilyScrum();

  if (familyScrum.view.name !== "dashboard") {
    throw new Error("You are not in the dashboard state");
  }

  return familyScrum.view.state;
}
