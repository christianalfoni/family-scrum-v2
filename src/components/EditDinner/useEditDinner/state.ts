import { createStates, StatesUnion } from "react-states";
import { DinnerDTO } from "../../../types";

import { actions } from "./actions";

const validationStates = createStates({
  VALID: () => ({}),
  INVALID: () => ({}),
});

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

type BaseState = {
  newIngredientName: string;
  newPreparationDescription: string;
  dinner: DinnerDTO;
  imageSrc?: string;
};

export const states = createStates({
  EDITING: ({
    dinner,
    newIngredientName,
    newPreparationDescription,
    imageSrc,
  }: BaseState) => ({
    dinner,
    newIngredientName,
    newPreparationDescription,
    imageSrc,
    validation: validateDinner(dinner),
    ...actions,
  }),
});

export type State = StatesUnion<typeof states>;
