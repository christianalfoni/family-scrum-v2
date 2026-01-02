import { signal } from "impact-app";
import { gt } from "semver";

const STORAGE_KEY = "family-scrum.version";

/**
 * This app is installed on the home screen and often uses the
 * cached version when opening. This ensures that we detect when a new version is available
 * and notify that another refresh will get you to that latest version
 */
export function useVersion() {
  const hasNew = signal(false);
  const currentVersion = localStorage.getItem(STORAGE_KEY);

  // Fetch the latest version from the API
  fetch("/api/version")
    .then((res) => res.json())
    .then((data) => {
      const latestVersion = data.version;

      if (!currentVersion || gt(latestVersion, currentVersion)) {
        hasNew.value = true;
      }

      localStorage.setItem(STORAGE_KEY, latestVersion);
    })
    .catch((error) => {
      console.error("Failed to fetch version:", error);
    });

  return {
    get hasNew() {
      return hasNew.value;
    },
  };
}
