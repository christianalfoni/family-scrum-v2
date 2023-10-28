import { createActions, ActionsUnion } from "react-states";

export const actions = createActions({
  ADD_IMAGE_SOURCE: (src: string) => ({
    src,
  }),
  NAME_CHANGED: (name: string) => ({
    name,
  }),
  DESCRIPTION_CHANGED: (description: string) => ({
    description,
  }),
  NEW_INGREDIENT_NAME_CHANGED: (name: string) => ({
    name,
  }),
  ADD_INGREDIENT: () => ({}),
  REMOVE_INGREDIENT: (index: number) => ({
    index,
  }),
  NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED: (description: string) => ({
    description,
  }),
  ADD_PREPARATION_ITEM: () => ({}),
  REMOVE_PREPARATION_ITEM: (index: number) => ({
    index,
  }),
  ADD_INSTRUCTION: () => ({}),
  INSTRUCTION_CHANGED: ({
    instruction,
    index,
  }: {
    instruction: string;
    index: number;
  }) => ({
    instruction,
    index,
  }),
  REMOVE_INSTRUCTION: (index: number) => ({
    index,
  }),
  SAVE: () => ({}),
});

export type Action = ActionsUnion<typeof actions>;
