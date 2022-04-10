import { createContext, useContext } from "react";
import { States, StatesTransition, useStateEffect } from "react-states";

import {
  useEnvironment,
  createReducer,
  useReducer,
} from "../../environment-interface";
import { DinnerDTO } from "../../environment-interface/storage";

export type Dinner = DinnerDTO;

type NewDinner = {
  name: string;
  description: string;
  preparationCheckList: string[];
  groceries: Array<{ name: string; shopCount: number }>;
  instructions: string[];
};

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
        state: "CREATING";
        dinner: NewDinner;
      }
    | {
        state: "EDITING";
        dinner: Dinner;
      }
    | {
        state: "SAVING";
        dinner: NewDinner;
      }
    | {
        state: "UPDATING";
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
      type: "INCREASE_SHOP_COUNT";
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

export type DinnerFeature = States<State, Action>;

type Transition = StatesTransition<DinnerFeature>;

const featureContext = createContext({} as DinnerFeature);

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

const reducer = createReducer<DinnerFeature>({
  CREATING: {
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
        groceries: [
          ...state.dinner.groceries,
          {
            name: state.newIngredientName,
            shopCount: 1,
          },
        ],
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
    INCREASE_SHOP_COUNT: (state, { index }): Transition => ({
      ...state,
      dinner: {
        ...state.dinner,
        groceries: state.dinner.groceries.map((grocery, groceryIndex) =>
          groceryIndex === index
            ? {
                ...grocery,
                shopCount: grocery.shopCount + 1,
              }
            : grocery
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
  EDITING: {
    NAME_CHANGED: (state, { name }): Transition => ({
      ...state,
      dinner: {
        ...state.dinner,
        name,
      },
    }),
    DESCRIPTION_CHANGED: (state, { description }): Transition => ({
      ...state,
      dinner: {
        ...state.dinner,
        description,
      },
    }),
  },
  SAVING: {},
  UPDATING: {},
});

export const useFeature = () => useContext(featureContext);

export const Feature = ({
  children,
  dinner,
}: {
  children: React.ReactNode;
  dinner?: Dinner;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(
    "Dinner",
    reducer,
    dinner
      ? {
          state: "EDITING",
          dinner: dinner,
          newIngredientName: "",
          newPreparationDescription: "",
          validation: {
            state: "VALID",
          },
        }
      : {
          state: "CREATING",
          dinner: {
            name: "",
            description: "",
            instructions: [""],
            groceries: [],
            preparationCheckList: [],
          },
          newIngredientName: "",
          newPreparationDescription: "",
          validation: {
            state: "INVALID",
          },
        }
  );

  const [state] = feature;

  useStateEffect(state, "SAVING", () => {});

  useStateEffect(state, "UPDATING", () => {});

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
