export interface Version {
  /**
   * @fires VERSION:NEW
   * @fires VERSION:UP_TO_DATE
   */
  checkVersion(): void;
}
