export const actions = {
  DESCRIPTION_CHANGED: (description: string) => ({
    type: "DESCRIPTION_CHANGED" as const,
    description,
  }),
  DATE_TOGGLED: () => ({
    type: "DATE_TOGGLED" as const,
  }),
  DATE_CHANGED: (date: number) => ({
    type: "DATE_CHANGED" as const,
    date,
  }),
  TIME_TOGGLED: () => ({
    type: "TIME_TOGGLED" as const,
  }),
  TIME_CHANGED: (time: string) => ({
    type: "TIME_CHANGED" as const,
    time,
  }),
  CHECKLIST_TOGGLED: () => ({
    type: "CHECKLIST_TOGGLED" as const,
  }),
  CHECKLIST_ITEM_ADDED: (title: string) => ({
    type: "CHECKLIST_ITEM_ADDED" as const,
    title,
  }),
  CHECKLIST_ITEM_REMOVED: (index: number) => ({
    type: "CHECKLIST_ITEM_REMOVED" as const,
    index,
  }),
  ADD_TODO: () => ({
    type: "ADD_TODO" as const,
  }),
};

export type Action = ReturnType<typeof actions[keyof typeof actions]>;
