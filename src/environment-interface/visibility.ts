export type VisibilityEvent =
  | {
      type: "VISIBILITY:VISIBLE";
    }
  | {
      type: "VISIBILITY:HIDDEN";
    };

export interface Visibility {}
