/**
 * Get the application version.
 * This value is injected at build time from package.json.
 */
export function getAppVersion(): string {
  return __APP_VERSION__;
}
