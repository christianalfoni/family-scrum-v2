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
  checkVersion(): void;
  update(): void;
}
