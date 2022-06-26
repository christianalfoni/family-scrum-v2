import { TEmit } from "react-environment-interface";
import gt from "semver/functions/gt";
import { Version, VersionEvent } from "../../environment-interface/version";

const STORAGE_KEY = "family-scrum.sandbox.version";

export const createVersion = (
  emit: TEmit<VersionEvent>,
  localVersion: string,
  version: string
): Version => ({
  checkVersion() {
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
  update() {},
});
