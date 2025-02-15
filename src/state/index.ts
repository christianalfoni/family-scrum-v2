import { CameraApi, createCamera } from "../utils/camera";
import { createFirebase, type FirebaseApi } from "../utils/firebase";
import { family } from "../utils/firebase/converters";
import { createSession } from "./session";

export type Utils = {
  firebase: FirebaseApi;
  camera: CameraApi;
};

const session = createSession({
  camera: createCamera(),
  firebase: createFirebase(),
});

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
