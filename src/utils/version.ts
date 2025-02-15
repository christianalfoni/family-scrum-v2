import { gt } from "semver";

const fetchVersion = async () => {
  const response = await fetch("/api/version");
  const { version } = await response.json();

  return version as string;
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
