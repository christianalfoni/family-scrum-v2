import { events } from "react-states";
import { Version } from ".";

export const createVersion = (): Version => ({
  events: events(),
  checkVersion() {},
  update() {},
});
