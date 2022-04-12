import {
  StatesReducer,
  StatesTransition,
  useCommandEffect,
  useStateEffect,
} from "react-states";

import {
  useEnvironment,
  createReducer,
  useReducer,
} from "../../environment-interface";
import { DinnerDTO } from "../../environment-interface/storage";

export type Dinner = DinnerDTO;

type ValidationState =
  | {
      state: "VALID";
    }
  | {
      state: "INVALID";
    };

type BaseState = {
  newIngredientName: string;
  newPreparationDescription: string;
  validation: ValidationState;
};

type State = BaseState &
  (
    | {
        state: "EDITING";
        dinner: Dinner;
      }
    | {
        state: "SAVING";
        dinner: Dinner;
      }
  );

type Action =
  | {
      type: "NAME_CHANGED";
      name: string;
    }
  | {
      type: "DESCRIPTION_CHANGED";
      description: string;
    }
  | {
      type: "NEW_INGREDIENT_NAME_CHANGED";
      name: string;
    }
  | {
      type: "ADD_INGREDIENT";
    }
  | {
      type: "REMOVE_INGREDIENT";
      index: number;
    }
  | {
      type: "NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED";
      description: string;
    }
  | {
      type: "ADD_PREPARATION_ITEM";
    }
  | {
      type: "REMOVE_PREPARATION_ITEM";
      index: number;
    }
  | {
      type: "ADD_INSTRUCTION";
    }
  | {
      type: "INSTRUCTION_CHANGED";
      instruction: string;
      index: number;
    }
  | {
      type: "REMOVE_INSTRUCTION";
      index: number;
    }
  | {
      type: "SAVE";
    };

type Command = {
  cmd: "EXIT";
};

export type DinnerReducer = StatesReducer<State, Action, Command>;

type Transition = StatesTransition<DinnerReducer>;

function validateDinner({
  name,
  description,
  instructions,
}: {
  name: string;
  description: string;
  instructions: string[];
}): ValidationState {
  if (name.length && description.length && instructions.length) {
    return {
      state: "VALID",
    };
  }

  return {
    state: "INVALID",
  };
}

export const reducer = createReducer<DinnerReducer>({
  EDITING: {
    NAME_CHANGED: (state, { name }): Transition => {
      const dinner = {
        ...state.dinner,
        name,
      };

      return {
        ...state,
        dinner,
        validation: validateDinner(dinner),
      };
    },
    DESCRIPTION_CHANGED: (state, { description }): Transition => {
      const dinner = {
        ...state.dinner,
        description,
      };

      return {
        ...state,
        dinner,
        validation: validateDinner(dinner),
      };
    },
    NEW_INGREDIENT_NAME_CHANGED: (state, { name }): Transition => ({
      ...state,
      newIngredientName: name,
    }),
    ADD_INGREDIENT: (state): Transition => ({
      ...state,
      dinner: {
        ...state.dinner,
        groceries: [...state.dinner.groceries, state.newIngredientName],
      },
      newIngredientName: "",
    }),
    REMOVE_INGREDIENT: (state, { index }): Transition => ({
      ...state,
      dinner: {
        ...state.dinner,
        groceries: state.dinner.groceries.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      },
    }),
    NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED: (
      state,
      { description }
    ): Transition => ({
      ...state,
      newPreparationDescription: description,
    }),
    ADD_PREPARATION_ITEM: (state): Transition => ({
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
    REMOVE_PREPARATION_ITEM: (state, { index }): Transition => ({
      ...state,
      dinner: {
        ...state.dinner,
        preparationCheckList: state.dinner.preparationCheckList.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      },
    }),
    INSTRUCTION_CHANGED: (state, { instruction, index }): Transition => ({
      ...state,
      dinner: {
        ...state.dinner,
        instructions: state.dinner.instructions.map(
          (current, instructionIndex) =>
            index === instructionIndex ? instruction : current
        ),
      },
    }),
    ADD_INSTRUCTION: (state): Transition => {
      const dinner = {
        ...state.dinner,
        instructions: [...state.dinner.instructions, ""],
      };

      return {
        ...state,
        dinner,
        validation: validateDinner(dinner),
      };
    },
    REMOVE_INSTRUCTION: (state, { index }): Transition => {
      const dinner = {
        ...state.dinner,
        instructions: state.dinner.instructions.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      };

      return {
        ...state,
        dinner,
        validation: validateDinner(dinner),
      };
    },
    SAVE: (state): Transition =>
      state.validation.state === "VALID"
        ? {
            ...state,
            state: "SAVING",
          }
        : state,
  },
  SAVING: {
    "STORAGE:DINNERS_UPDATE": (state, { dinners }): Transition =>
      state.dinner.id in dinners
        ? [
            state,
            {
              cmd: "EXIT",
            },
          ]
        : state,
  },
});
