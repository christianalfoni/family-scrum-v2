import { createActions, ActionsUnion } from "react-states";

export const actions = createActions({
  DESCRIPTION_CHANGED: (description: string) => ({
    description,
  }),
  DATE_TOGGLED: () => ({}),
  DATE_CHANGED: (date: number) => ({
    date,
  }),
  TIME_TOGGLED: () => ({}),
  TIME_CHANGED: (time: string) => ({
    time,
  }),
  CHECKLIST_TOGGLED: () => ({}),
  CHECKLIST_ITEM_ADDED: (title: string) => ({
    title,
  }),
  CHECKLIST_ITEM_REMOVED: (index: number) => ({
    index,
  }),
  GROCERY_TOGGLED: () => ({}),
  GROCERY_NAME_CHANGED: (name: string) => ({
    name,
  }),
  ADD_TODO: () => ({}),
});

export type Action = ActionsUnion<typeof actions>;
