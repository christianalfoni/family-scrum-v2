import { context } from "impact-context";
import { signal } from "impact-signal";

import { gt } from "semver";

const fetchVersion = async () => {
  const response = await fetch("/api/version");
  const { version } = await response.json();

  return version as string;
};

const STORAGE_KEY = "family-scrum.version";

export function createVersion() {
  const hasNew = signal(false);
  const currentVersion = localStorage.getItem(STORAGE_KEY);

  fetchVersion().then((version) => {
    if (!currentVersion || gt(version, currentVersion)) {
      hasNew.value = true;
    }

    localStorage.setItem(STORAGE_KEY, version);
  });

  return {
    get hasNew() {
      return hasNew.value;
    },
  };
}
