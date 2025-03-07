import { Session } from "./Session";
import { Environment } from "../Environment";

export function State(env: Environment) {
  return Session({ env });
}
