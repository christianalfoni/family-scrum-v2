export const actions = {
  ADD_IMAGE_SOURCE: (src: string) => ({
    type: "ADD_IMAGE_SOURCE" as const,
    src,
  }),
  NAME_CHANGED: (name: string) => ({
    type: "NAME_CHANGED" as const,
    name,
  }),
  DESCRIPTION_CHANGED: (description: string) => ({
    type: "DESCRIPTION_CHANGED" as const,
    description,
  }),
  NEW_INGREDIENT_NAME_CHANGED: (name: string) => ({
    type: "NEW_INGREDIENT_NAME_CHANGED" as const,
    name,
  }),
  ADD_INGREDIENT: () => ({
    type: "ADD_INGREDIENT" as const,
  }),
  REMOVE_INGREDIENT: (index: number) => ({
    type: "REMOVE_INGREDIENT" as const,
    index,
  }),
  NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED: (description: string) => ({
    type: "NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED" as const,
    description,
  }),
  ADD_PREPARATION_ITEM: () => ({
    type: "ADD_PREPARATION_ITEM" as const,
  }),
  REMOVE_PREPARATION_ITEM: (index: number) => ({
    type: "REMOVE_PREPARATION_ITEM" as const,
    index,
  }),
  ADD_INSTRUCTION: () => ({
    type: "ADD_INSTRUCTION" as const,
  }),
  INSTRUCTION_CHANGED: (params: { instruction: string; index: number }) => ({
    type: "INSTRUCTION_CHANGED" as const,
    ...params,
  }),
  REMOVE_INSTRUCTION: (index: number) => ({
    type: "REMOVE_INSTRUCTION" as const,
    index,
  }),
  SAVE: () => ({
    type: "SAVE" as const,
  }),
};

export type Action = ReturnType<typeof actions[keyof typeof actions]>;
