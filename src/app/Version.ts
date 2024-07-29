import { gt } from "semver";

const STORAGE_KEY = "family-scrum.version";

/**
 * This app is installed on the home screen and often uses the
 * cached version when opening. This ensures that we detect when a new version is available
 * not notify that another refresh will get you to that latest version
 */
export async function detectNewVersion() {
  const currentVersion = localStorage.getItem(STORAGE_KEY);
  const version = await fetchVersion();

  localStorage.setItem(STORAGE_KEY, version);

  return currentVersion && gt(version, currentVersion);

  async function fetchVersion() {
    const response = await fetch("/api/version");
    const { version } = await response.json();

    return version as string;
  }
}
