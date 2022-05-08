import { actions } from "./actions";

export const dateStates = {
  INACTIVE: () => ({
    state: "INACTIVE" as const,
  }),
  ACTIVE: (date: number) => ({
    state: "ACTIVE" as const,
    date,
    DATE_CHANGED: actions.DATE_CHANGED,
  }),
};

type DateState = ReturnType<typeof dateStates[keyof typeof dateStates]>;

export const timeStates = {
  INACTIVE: () => ({
    state: "INACTIVE" as const,
  }),
  ACTIVE: (time: string) => ({
    state: "ACTIVE" as const,
    time,
    TIME_CHANGED: actions.TIME_CHANGED,
  }),
};

type TimeState = ReturnType<typeof timeStates[keyof typeof timeStates]>;

export const checklistStates = {
  INACTIVE: () => ({
    state: "INACTIVE" as const,
  }),
  ACTIVE: (items: Array<{ title: string; id?: string }>) => ({
    state: "ACTIVE" as const,
    items,
    CHECKLIST_ITEM_ADDED: actions.CHECKLIST_ITEM_ADDED,
    CHECKLIST_ITEM_REMOVED: actions.CHECKLIST_ITEM_REMOVED,
  }),
};

type ChecklistState = ReturnType<
  typeof checklistStates[keyof typeof checklistStates]
>;

export const validationStates = {
  VALID: () => ({
    state: "VALID" as const,
    ADD_TODO: actions.ADD_TODO,
  }),
  INVALID: () => ({
    state: "INVALID" as const,
  }),
};

type ValidationState = ReturnType<
  typeof validationStates[keyof typeof validationStates]
>;

type BaseState = {
  description: string;
  date: DateState;
  time: TimeState;
  checkList: ChecklistState;
};

const states = {
  EDITING: ({ checkList, date, description, time }: BaseState) => {
    const validation = description
      ? validationStates.VALID()
      : validationStates.INVALID();

    return {
      state: "EDITING" as const,
      description,
      time,
      date,
      checkList,
      validation,
      DESCRIPTION_CHANGED: actions.DESCRIPTION_CHANGED,
      TIME_TOGGLED: actions.TIME_TOGGLED,
      DATE_TOGGLED: actions.DATE_TOGGLED,
      CHECKLIST_TOGGLED: actions.CHECKLIST_TOGGLED,
    };
  },
};

export type State = ReturnType<typeof states[keyof typeof states]>;

export const { EDITING } = states;
