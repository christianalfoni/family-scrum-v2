import { useReducer, useState } from "react";
import {
  $COMMAND,
  IAction,
  ICommand,
  PickCommand,
  ReturnTypes,
  transition,
  TTransitions,
  useCommandEffect,
  useDevtools,
  useStateEffect,
} from "react-states";

import { useEnvironment } from "../../environment-interface";
import { DinnerDTO } from "../../environment-interface/storage";
import { useImage } from "../../useImage";

const actions = {
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

type Action = ReturnTypes<typeof actions, IAction>;

const commands = {
  EXIT: () => ({
    cmd: "EXIT" as const,
  }),
};

type Command = ReturnTypes<typeof commands, ICommand>;

const validationStates = {
  VALID: () => ({
    state: "VALID" as const,
  }),
  INVALID: () => ({
    state: "INVALID" as const,
  }),
};

type ValidationState = ReturnType<
  typeof validationStates.VALID | typeof validationStates.INVALID
>;

const EDITING = (
  params: {
    newIngredientName: string;
    newPreparationDescription: string;
    dinner: DinnerDTO;
    imageSrc?: string;
  },
  command?: PickCommand<Command, "EXIT">
) => ({
  state: "EDITING" as const,
  ...params,
  validation: validateDinner(params.dinner),
  [$COMMAND]: command,
  ...actions,
});

type State = ReturnType<typeof EDITING>;

const validateDinner = ({
  name,
  description,
  instructions,
}: {
  name: string;
  description: string;
  instructions: string[];
}) =>
  name.length && description.length && instructions.length
    ? validationStates.VALID()
    : validationStates.INVALID();

const transitions: TTransitions<State, Action> = {
  EDITING: {
    NAME_CHANGED: (state, { name }) =>
      EDITING({
        ...state,
        dinner: {
          ...state.dinner,
          name,
        },
      }),
    DESCRIPTION_CHANGED: (state, { description }) =>
      EDITING({
        ...state,
        dinner: {
          ...state.dinner,
          description,
        },
      }),
    NEW_INGREDIENT_NAME_CHANGED: (state, { name }) =>
      EDITING({
        ...state,
        newIngredientName: name,
      }),
    ADD_INGREDIENT: (state) =>
      EDITING({
        ...state,
        dinner: {
          ...state.dinner,
          groceries: [...state.dinner.groceries, state.newIngredientName],
        },
        newIngredientName: "",
      }),
    REMOVE_INGREDIENT: (state, { index }) =>
      EDITING({
        ...state,
        dinner: {
          ...state.dinner,
          groceries: state.dinner.groceries.filter(
            (_, itemIndex) => itemIndex !== index
          ),
        },
      }),
    NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED: (state, { description }) =>
      EDITING({
        ...state,
        newPreparationDescription: description,
      }),
    ADD_PREPARATION_ITEM: (state) =>
      EDITING({
        ...state,
        dinner: {
          ...state.dinner,
          preparationCheckList: [
            ...state.dinner.preparationCheckList,
            state.newPreparationDescription,
          ],
        },
        newPreparationDescription: "",
      }),
    REMOVE_PREPARATION_ITEM: (state, { index }) =>
      EDITING({
        ...state,
        dinner: {
          ...state.dinner,
          preparationCheckList: state.dinner.preparationCheckList.filter(
            (_, itemIndex) => itemIndex !== index
          ),
        },
      }),
    INSTRUCTION_CHANGED: (state, { instruction, index }) =>
      EDITING({
        ...state,
        dinner: {
          ...state.dinner,
          instructions: state.dinner.instructions.map(
            (current, instructionIndex) =>
              index === instructionIndex ? instruction : current
          ),
        },
      }),
    ADD_INSTRUCTION: (state) =>
      EDITING({
        ...state,
        dinner: {
          ...state.dinner,
          instructions: [...state.dinner.instructions, ""],
        },
      }),
    REMOVE_INSTRUCTION: (state, { index }) =>
      EDITING({
        ...state,
        dinner: {
          ...state.dinner,
          instructions: state.dinner.instructions.filter(
            (_, itemIndex) => itemIndex !== index
          ),
        },
      }),
    ADD_IMAGE_SOURCE: (state, { src }) =>
      EDITING({
        ...state,
        imageSrc: src,
      }),
    SAVE: (state) =>
      state.validation.state === "VALID"
        ? EDITING(state, commands.EXIT())
        : state,
  },
};

const reducer = (state: State, action: Action) =>
  transition(state, action, transitions);

export const useEditDinner = ({
  dinner,
  onExit,
  initialState,
}: {
  dinner?: DinnerDTO;
  initialState?: State;
  onExit: () => void;
}) => {
  const { storage } = useEnvironment();
  const dinnerReducer = useReducer(
    reducer,
    initialState ||
      EDITING({
        dinner: dinner || {
          id: storage.createDinnerId(),
          name: "",
          description: "",
          instructions: [""],
          groceries: [],
          preparationCheckList: [],
          modified: Date.now(),
          created: Date.now(),
        },
        newIngredientName: "",
        newPreparationDescription: "",
      })
  );

  useDevtools("Dinner", dinnerReducer);

  const [state, dispatch] = dinnerReducer;

  const imageReducer = useImage({
    ref: storage.getDinnerImageRef(state.dinner.id),
  });

  const [imageState] = imageReducer;

  useCommandEffect(state, "EXIT", onExit);

  useStateEffect(imageState, "CAPTURED", ({ src }) => {
    dispatch({
      type: "ADD_IMAGE_SOURCE",
      src,
    });
  });

  return {
    dinner: dinnerReducer,
    image: imageReducer,
  };
};
