import { StatesReducer, useCommandEffect, useStateEffect } from "react-states";

import {
  useEnvironment,
  createReducer,
  useReducer,
} from "../../environment-interface";
import { DinnerDTO } from "../../environment-interface/storage";
import { useImage } from "./useImage";

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

type State = BaseState & {
  state: "EDITING";
  dinner: Dinner;
  imageSrc?: string;
};

type Action =
  | {
      type: "ADD_IMAGE_SOURCE";
      src: string;
    }
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

const reducer = createReducer<DinnerReducer>({
  EDITING: {
    NAME_CHANGED: ({ state, action: { name }, transition }) => {
      const dinner = {
        ...state.dinner,
        name,
      };

      return transition({
        ...state,
        dinner,
        validation: validateDinner(dinner),
      });
    },
    DESCRIPTION_CHANGED: ({ state, action: { description }, transition }) => {
      const dinner = {
        ...state.dinner,
        description,
      };

      return transition({
        ...state,
        dinner,
        validation: validateDinner(dinner),
      });
    },
    NEW_INGREDIENT_NAME_CHANGED: ({ state, action: { name }, transition }) =>
      transition({
        ...state,
        newIngredientName: name,
      }),
    ADD_INGREDIENT: ({ state, transition }) =>
      transition({
        ...state,
        dinner: {
          ...state.dinner,
          groceries: [...state.dinner.groceries, state.newIngredientName],
        },
        newIngredientName: "",
      }),
    REMOVE_INGREDIENT: ({ state, action: { index }, transition }) =>
      transition({
        ...state,
        dinner: {
          ...state.dinner,
          groceries: state.dinner.groceries.filter(
            (_, itemIndex) => itemIndex !== index
          ),
        },
      }),
    NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED: ({
      state,
      action: { description },
      transition,
    }) =>
      transition({
        ...state,
        newPreparationDescription: description,
      }),
    ADD_PREPARATION_ITEM: ({ state, transition }) =>
      transition({
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
    REMOVE_PREPARATION_ITEM: ({ state, action: { index }, transition }) =>
      transition({
        ...state,
        dinner: {
          ...state.dinner,
          preparationCheckList: state.dinner.preparationCheckList.filter(
            (_, itemIndex) => itemIndex !== index
          ),
        },
      }),
    INSTRUCTION_CHANGED: ({
      state,
      action: { instruction, index },
      transition,
    }) =>
      transition({
        ...state,
        dinner: {
          ...state.dinner,
          instructions: state.dinner.instructions.map(
            (current, instructionIndex) =>
              index === instructionIndex ? instruction : current
          ),
        },
      }),
    ADD_INSTRUCTION: ({ state, transition }) => {
      const dinner = {
        ...state.dinner,
        instructions: [...state.dinner.instructions, ""],
      };

      return transition({
        ...state,
        dinner,
        validation: validateDinner(dinner),
      });
    },
    REMOVE_INSTRUCTION: ({ state, action: { index }, transition }) => {
      const dinner = {
        ...state.dinner,
        instructions: state.dinner.instructions.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      };

      return transition({
        ...state,
        dinner,
        validation: validateDinner(dinner),
      });
    },
    ADD_IMAGE_SOURCE: ({ state, action: { src }, transition }) =>
      transition({
        ...state,
        imageSrc: src,
      }),
    SAVE: ({ state, transition, noop }) =>
      state.validation.state === "VALID"
        ? transition(state, {
            cmd: "$CALL_ENVIRONMENT",
            target: "storage.storeDinner",
            params: [state.dinner, state.imageSrc],
          })
        : noop(),
  },
});

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
    "Dinner",
    reducer,
    initialState || {
      state: "EDITING",
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
      validation: dinner
        ? {
            state: "VALID",
          }
        : {
            state: "INVALID",
          },
    }
  );

  const [state, dispatch] = dinnerReducer;

  const imageReducer = useImage({
    ref: storage.getDinnerImageRef(state.dinner.id),
  });

  const [imageState] = imageReducer;

  useCommandEffect(state, "EXIT", () => {
    onExit();
  });

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
