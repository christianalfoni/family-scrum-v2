import { Version, VersionEvent } from "../../environment-interface/version";
import gt from "semver/functions/gt";
import { Emit } from "react-states";

const STORAGE_KEY = "family-scrum.version";

export const createVersion = (emit: Emit<VersionEvent>): Version => ({
  async checkVersion() {
    const response = await fetch("/api/version");
    const { version }: { version: string } = await response.json();
    const localVersion = localStorage.getItem(STORAGE_KEY);

    if (localVersion && gt(version, localVersion)) {
      emit({
        type: "VERSION:NEW",
        newVersion: version,
        version: localVersion,
      });
    }
    if (!localVersion) {
      localStorage.setItem(STORAGE_KEY, version);
    } else {
      emit({
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
