import { createActions, ActionsUnion } from "react-states";
import { ViewState } from "./state";

export const actions = createActions({
  PUSH_VIEW: (view: ViewState) => ({
    view,
  }),
  POP_VIEW: () => ({}),
  REPLACE_VIEW: (view: ViewState) => ({
    view,
  }),
});

export type Action = ActionsUnion<typeof actions>;
