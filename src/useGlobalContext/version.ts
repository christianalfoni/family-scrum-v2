import { signal } from "impact-app";
import { gt } from "semver";

const getCurrentVersion = () => {
  return __APP_VERSION__;
};

const STORAGE_KEY = "family-scrum.version";

/**
 * This app is installed on the home screen and often uses the
 * cached version when opening. This ensures that we detect when a new version is available
 * not notify that another refresh will get you to that latest version
 */
export function useVersion() {
  const hasNew = signal(false);
  const currentVersion = localStorage.getItem(STORAGE_KEY);
  const version = getCurrentVersion();

  if (!currentVersion || gt(version, currentVersion)) {
    hasNew.value = true;
  }

  localStorage.setItem(STORAGE_KEY, version);

  return {
    get hasNew() {
      return hasNew.value;
    },
  };
}
