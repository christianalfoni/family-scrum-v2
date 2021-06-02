import { events } from "react-states";
import { Version } from ".";
import gt from "semver/functions/gt";

const STORAGE_KEY = "family-scrum.version";

export const createVersion = (): Version => ({
  events: events(),
  async checkVersion() {
    const response = await fetch("/api/version");
    const { version }: { version: string } = await response.json();
    const localVersion = localStorage.getItem(STORAGE_KEY);

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
  async update() {
    const response = await fetch("/api/version");
    const { version }: { version: string } = await response.json();
    localStorage.setItem(STORAGE_KEY, version);
    location.reload();
  },
});
