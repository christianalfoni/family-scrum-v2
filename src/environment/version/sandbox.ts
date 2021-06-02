import { events } from "react-states";
import gt from "semver/functions/gt";
import { Version } from ".";

const STORAGE_KEY = "family-scrum.sandbox.version";

export const createVersion = (
  localVersion: string,
  version: string
): Version => ({
  events: events(),
  checkVersion() {
    if (localVersion && gt(version, localVersion)) {
      this.events.emit({
        type: "VERSION:NEW",
        newVersion: version,
        version: localVersion,
      });
    }
    if (!localVersion) {
      localStorage.setItem(STORAGE_KEY, version);
    } else {
      this.events.emit({
        type: "VERSION:UP_TO_DATE",
      });
    }
  },
  update() {},
});
