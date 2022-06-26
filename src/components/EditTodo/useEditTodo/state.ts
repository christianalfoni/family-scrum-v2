import { createStates, StatesUnion } from "react-states";

export const dateStates = createStates({
  INACTIVE: () => ({}),
  ACTIVE: (date: number) => ({
    date,
  }),
});

type DateState = StatesUnion<typeof dateStates>;

export const timeStates = createStates({
  INACTIVE: () => ({}),
  ACTIVE: (time: string) => ({
    state: "ACTIVE" as const,
    time,
  }),
});

type TimeState = StatesUnion<typeof timeStates>;

export const checklistStates = createStates({
  INACTIVE: () => ({}),
  ACTIVE: (items: Array<{ title: string; id?: string }>) => ({
    items,
  }),
});

type ChecklistState = StatesUnion<typeof checklistStates>;

export const groceryStates = createStates({
  INACTIVE: () => ({}),
  ACTIVE: (name: string) => ({
    name,
  }),
});

type GroceryState = StatesUnion<typeof groceryStates>;

export const validationStates = createStates({
  VALID: () => ({}),
  INVALID: () => ({}),
});

type BaseState = {
  description: string;
  date: DateState;
  time: TimeState;
  checkList: ChecklistState;
  grocery: GroceryState;
};

export const states = createStates({
  EDITING: ({ checkList, date, description, time, grocery }: BaseState) => {
    const validation = description
      ? validationStates.VALID()
      : validationStates.INVALID();

    return {
      description,
      time,
      date,
      checkList,
      validation,
      grocery,
    };
  },
});

export type State = StatesUnion<typeof states>;
