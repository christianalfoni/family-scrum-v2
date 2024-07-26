import { createSignal } from "@/ratchit";
import { signal } from "impact-app";
import { gt } from "semver";

const STORAGE_KEY = "family-scrum.version";

/**
 * This app is installed on the home screen and often uses the
 * cached version when opening. This ensures that we detect when a new version is available
 * not notify that another refresh will get you to that latest version
 */
export class Version {
  #hasNew = createSignal(false);

  get hasNew() {
    return this.#hasNew.get();
  }

  constructor() {
    const currentVersion = localStorage.getItem(STORAGE_KEY);

    this.#fetchVersion().then((version) => {
      if (!currentVersion || gt(version, currentVersion)) {
        this.#hasNew.set(true);
      }

      localStorage.setItem(STORAGE_KEY, version);
    });
  }

  async #fetchVersion() {
    const response = await fetch("/api/version");
    const { version } = await response.json();

    return version as string;
  }
}
