import { useReducer } from "react";
import { transition, useDevtools, useEnter, useTransition } from "react-states";

import { useEnvironment } from "../../../environment-interface";
import { DinnerDTO } from "../../../environment-interface/storage";
import { useImage } from "../../../useImage";
import { Action, actions } from "./actions";
import { State, states } from "./state";

const reducer = (prevState: State, action: Action) =>
  transition(prevState, action, {
    EDITING: {
      NAME_CHANGED: (state, { name }) =>
        states.EDITING({
          ...state,
          dinner: {
            ...state.dinner,
            name,
          },
        }),
      DESCRIPTION_CHANGED: (state, { description }) =>
        states.EDITING({
          ...state,
          dinner: {
            ...state.dinner,
            description,
          },
        }),
      NEW_INGREDIENT_NAME_CHANGED: (state, { name }) =>
        states.EDITING({
          ...state,
          newIngredientName: name,
        }),
      ADD_INGREDIENT: (state) =>
        states.EDITING({
          ...state,
          dinner: {
            ...state.dinner,
            groceries: [...state.dinner.groceries, state.newIngredientName],
          },
          newIngredientName: "",
        }),
      REMOVE_INGREDIENT: (state, { index }) =>
        states.EDITING({
          ...state,
          dinner: {
            ...state.dinner,
            groceries: state.dinner.groceries.filter(
              (_, itemIndex) => itemIndex !== index
            ),
          },
        }),
      NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED: (state, { description }) =>
        states.EDITING({
          ...state,
          newPreparationDescription: description,
        }),
      ADD_PREPARATION_ITEM: (state) =>
        states.EDITING({
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
        states.EDITING({
          ...state,
          dinner: {
            ...state.dinner,
            preparationCheckList: state.dinner.preparationCheckList.filter(
              (_, itemIndex) => itemIndex !== index
            ),
          },
        }),
      INSTRUCTION_CHANGED: (state, { instruction, index }) =>
        states.EDITING({
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
        states.EDITING({
          ...state,
          dinner: {
            ...state.dinner,
            instructions: [...state.dinner.instructions, ""],
          },
        }),
      REMOVE_INSTRUCTION: (state, { index }) =>
        states.EDITING({
          ...state,
          dinner: {
            ...state.dinner,
            instructions: state.dinner.instructions.filter(
              (_, itemIndex) => itemIndex !== index
            ),
          },
        }),
      ADD_IMAGE_SOURCE: (state, { src }) =>
        states.EDITING({
          ...state,
          imageSrc: src,
        }),
      SAVE: (state) =>
        state.validation.state === "VALID" ? states.EDITING(state) : state,
    },
  });

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
      states.EDITING({
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
  const actionsDispatch = actions(dispatch);

  const imageReducer = useImage({
    ref: storage.getDinnerImageRef(state.dinner.id),
  });

  const [imageState] = imageReducer;

  useTransition(state, "EDITING => SAVE => EDITING", ({ dinner, imageSrc }) => {
    storage.storeDinner(dinner, imageSrc);
    onExit();
  });

  useEnter(imageState, "CAPTURED", ({ src }) => {
    actionsDispatch.ADD_IMAGE_SOURCE(src);
  });

  return {
    dinner: [state, actionsDispatch] as const,
    image: imageReducer,
  };
};
