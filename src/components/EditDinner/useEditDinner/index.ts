import { useReducer } from "react";
import {
  $COMMAND,
  PickCommand,
  transition,
  TTransitions,
  useCommandEffect,
  useDevtools,
  useStateEffect,
} from "react-states";

import { useEnvironment } from "../../../environment-interface";
import { DinnerDTO } from "../../../environment-interface/storage";
import { useImage } from "../../../useImage";
import { Action } from "./actions";
import { commands, State, EDITING } from "./state";

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
  initialDinner,
  onExit,
  initialState,
}: {
  initialDinner?: DinnerDTO;
  initialState?: State;
  onExit: () => void;
}) => {
  const { storage } = useEnvironment();
  const dinnerReducer = useReducer(
    reducer,
    initialState ||
      EDITING({
        dinner: initialDinner || {
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
    dispatch(state.ADD_IMAGE_SOURCE(src));
  });

  return {
    dinner: dinnerReducer,
    image: imageReducer,
  };
};
