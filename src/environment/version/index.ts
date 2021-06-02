import { Events } from "react-states";

export type VersionEvent =
  | {
      type: "VERSION:NEW";
      newVersion: string;
      version: string;
    }
  | {
      type: "VERSION:UP_TO_DATE";
    };

export interface Version {
  events: Events<VersionEvent>;
  /**
   * @fires VERSION:NEW
   * @fires VERSION:UP_TO_DATE
   */
  checkVersion(): void;
  update(): void;
}
