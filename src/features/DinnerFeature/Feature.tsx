import { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { DinnerDTO } from "../../environment/storage";

export type Dinner = DinnerDTO;

type NewDinner = {
  name: string;
  description: string;
  preparationCheckList: string[];
  groceries: Array<{ name: string; shopCount: number }>;
  instructions: string[];
};

type ValidationContext =
  | {
      state: "VALID";
    }
  | {
      state: "INVALID";
    };

type BaseContext = {
  newIngredientName: string;
  newPreparationDescription: string;
  validation: ValidationContext;
};

type Context = BaseContext &
  (
    | {
        state: "CREATING";
        dinner: NewDinner;
      }
    | {
        state: "EDITING";
        dinner: Dinner;
      }
  );

type TransientContext =
  | {
      state: "CREATING_DINNER";
      dinner: NewDinner;
    }
  | {
      state: "UPDATING_DINNER";
      dinner: Dinner;
    };

type UIEvent =
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

type Event = UIEvent;

const featureContext = createContext<Context, Event, TransientContext>();

function validateDinner({
  name,
  description,
  instructions,
}: {
  name: string;
  description: string;
  instructions: string[];
}): ValidationContext {
  if (name.length && description.length && instructions.length) {
    return {
      state: "VALID",
    };
  }

  return {
    state: "INVALID",
  };
}

const reducer = createReducer<Context, Event, TransientContext>(
  {
    CREATING: {
      NAME_CHANGED: ({ name }, context) => {
        const dinner = {
          ...context.dinner,
          name,
        };

        return {
          ...context,
          dinner,
          validation: validateDinner(dinner),
        };
      },
      DESCRIPTION_CHANGED: ({ description }, context) => {
        const dinner = {
          ...context.dinner,
          description,
        };

        return {
          ...context,
          dinner,
          validation: validateDinner(dinner),
        };
      },
      NEW_INGREDIENT_NAME_CHANGED: ({ name }, context) => ({
        ...context,
        newIngredientName: name,
      }),
      ADD_INGREDIENT: (_, context) => ({
        ...context,
        dinner: {
          ...context.dinner,
          groceries: [
            ...context.dinner.groceries,
            {
              name: context.newIngredientName,
              shopCount: 1,
            },
          ],
        },
        newIngredientName: "",
      }),
      REMOVE_INGREDIENT: ({ index }, context) => ({
        ...context,
        dinner: {
          ...context.dinner,
          groceries: context.dinner.groceries.filter(
            (_, itemIndex) => itemIndex !== index
          ),
        },
      }),
      INCREASE_SHOP_COUNT: ({ index }, context) => ({
        ...context,
        dinner: {
          ...context.dinner,
          groceries: context.dinner.groceries.map((grocery, groceryIndex) =>
            groceryIndex === index
              ? {
                  ...grocery,
                  shopCount: grocery.shopCount + 1,
                }
              : grocery
          ),
        },
      }),
      NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED: ({ description }, context) => ({
        ...context,
        newPreparationDescription: description,
      }),
      ADD_PREPARATION_ITEM: (_, context) => ({
        ...context,
        dinner: {
          ...context.dinner,
          preparationCheckList: [
            ...context.dinner.preparationCheckList,
            context.newPreparationDescription,
          ],
        },
        newPreparationDescription: "",
      }),
      REMOVE_PREPARATION_ITEM: ({ index }, context) => ({
        ...context,
        dinner: {
          ...context.dinner,
          preparationCheckList: context.dinner.preparationCheckList.filter(
            (_, itemIndex) => itemIndex !== index
          ),
        },
      }),
      INSTRUCTION_CHANGED: ({ instruction, index }, context) => ({
        ...context,
        dinner: {
          ...context.dinner,
          instructions: context.dinner.instructions.map(
            (current, instructionIndex) =>
              index === instructionIndex ? instruction : current
          ),
        },
      }),
      ADD_INSTRUCTION: (_, context) => {
        const dinner = {
          ...context.dinner,
          instructions: [...context.dinner.instructions, ""],
        };

        return {
          ...context,
          dinner,
          validation: validateDinner(dinner),
        };
      },
      REMOVE_INSTRUCTION: ({ index }, context) => {
        const dinner = {
          ...context.dinner,
          instructions: context.dinner.instructions.filter(
            (_, itemIndex) => itemIndex !== index
          ),
        };

        return {
          ...context,
          dinner,
          validation: validateDinner(dinner),
        };
      },
      SAVE: (_, context) =>
        context.validation.state === "VALID"
          ? {
              state: "CREATING_DINNER",
              dinner: context.dinner,
            }
          : context,
    },
    EDITING: {
      NAME_CHANGED: ({ name }, context) => ({
        ...context,
        dinner: {
          ...context.dinner,
          name,
        },
      }),
      DESCRIPTION_CHANGED: ({ description }, context) => ({
        ...context,
        dinner: {
          ...context.dinner,
          description,
        },
      }),
    },
  },
  {
    CREATING_DINNER: (_, prevContext) => prevContext,
    UPDATING_DINNER: (_, prevContext) => prevContext,
  }
);

export const useFeature = createHook(featureContext);

export const Feature = ({
  children,
  dinner,
}: {
  children: React.ReactNode;
  dinner?: Dinner;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(
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

  if (process.browser && process.env.NODE_ENV === "development") {
    useDevtools("Dinner", feature);
  }

  const [context, send] = feature;

  useEnterEffect(context, "CREATING_DINNER", () => {});

  useEnterEffect(context, "UPDATING_DINNER", () => {});

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
