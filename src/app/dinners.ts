import { createCamera } from "./camera";
import { Firebase } from "./firebase";

export type Dinners = ReturnType<typeof createDinners>;

export function createDinners(firebase: Firebase) {
  const camera = createCamera();

  return {};
}
