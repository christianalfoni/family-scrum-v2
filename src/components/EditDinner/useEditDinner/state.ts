import { DinnerDTO } from "../../../environment-interface/storage";
import { actions } from "./actions";

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

type BaseState = {
  newIngredientName: string;
  newPreparationDescription: string;
  dinner: DinnerDTO;
  imageSrc?: string;
};

const states = {
  EDITING: ({
    dinner,
    newIngredientName,
    newPreparationDescription,
    imageSrc,
  }: BaseState) => ({
    state: "EDITING" as const,
    dinner,
    newIngredientName,
    newPreparationDescription,
    imageSrc,
    validation: validateDinner(dinner),

    ...actions,
  }),
};

export type State = ReturnType<typeof states[keyof typeof states]>;

export const { EDITING } = states;
