import { Camera } from "./Camera";
import { Version } from "./Version";
import { Views } from "./Views";

export class App {
  views = new Views();
  version = new Version();
  camera = new Camera();
}
