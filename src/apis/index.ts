import { createCamera } from "./camera";
import { createFirebase } from "./firebase";

export type Apis = typeof apis;

export const apis = {
  camera: createCamera(),
  firebase: createFirebase(),
};
