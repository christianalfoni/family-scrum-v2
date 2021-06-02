import { events } from "react-states";
import { Version } from ".";
import gt from "semver/functions/gt";

export const createVersion = (): Version => ({
  events: events(),
  async checkVersion() {
    const response = await fetch("/api/version");
    const { version }: { version: string } = await response.json();
    const localVersion = localStorage.getItem("family-scrum.version");

    if (localVersion && gt(version, localVersion)) {
      this.events.emit({
        type: "VERSION:NEW",
        newVersion: version,
        version: localVersion,
      });
    }
    if (!localVersion) {
      localStorage.setItem("family-scrum.version", version);
    } else {
      this.events.emit({
        type: "VERSION:UP_TO_DATE",
      });
    }
  },
  async update() {
    const response = await fetch("/api/version");
    const { version }: { version: string } = await response.json();
    localStorage.setItem("family-scrum.version", version);
    location.reload();
  },
});
