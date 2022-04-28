import type { ViewState } from "./state";

export const actions = {
  PUSH_VIEW: (view: ViewState) => ({
    type: "PUSH_VIEW" as const,
    view,
  }),
  POP_VIEW: () => ({
    type: "POP_VIEW" as const,
  }),
  REPLACE_VIEW: (view: ViewState) => ({
    type: "REPLACE_VIEW" as const,
    view,
  }),
};

export type Action = ReturnType<typeof actions[keyof typeof actions]>;
