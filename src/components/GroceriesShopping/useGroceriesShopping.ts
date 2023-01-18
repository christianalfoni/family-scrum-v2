import { useReducer } from "react";
import {
  createActions,
  createStates,
  ActionsUnion,
  StatesUnion,
  match,
  transition,
  useDevtools,
  useTransition,
} from "react-states";
import { useEnvironment } from "../../environment-interface";
import { User } from "../../hooks/useCurrentUser";
import {
  useCreateGroceryId,
  useDeleteGrocery,
  useStoreGrocery,
} from "../../hooks/useGroceries";

const actions = createActions({
  ADD_GROCERY: () => ({}),
  GROCERY_INPUT_CHANGED: (input: string) => ({
    input,
  }),
  SHOP_GROCERY: (groceryId: string) => ({
    groceryId,
  }),
  TOGGLE_NO_SLEEP: () => ({}),
});

type Action = ActionsUnion<typeof actions>;

const sleepStates = createStates({
  ALLOW_SLEEP: () => ({}),
  PREVENT_SLEEP: () => ({}),
});

type SleepState = StatesUnion<typeof sleepStates>;

const filterStates = createStates({
  FILTERED: (input: string) => ({ input }),
  UNFILTERED: () => ({ input: "" }),
});

type FilterState = StatesUnion<typeof filterStates>;

type BaseState = {
  filter: FilterState;
  sleep: SleepState;
};

const states = createStates({
  LIST: ({ sleep, filter }: Pick<BaseState, "sleep" | "filter">) => ({
    sleep,
    filter,
    ...actions,
  }),
});

type State = StatesUnion<typeof states>;

const reducer = (prevState: State, action: Action) =>
  transition(prevState, action, {
    LIST: {
      SHOP_GROCERY: (state) => states.LIST(state),
      TOGGLE_NO_SLEEP: (state) => ({
        ...state,
        sleep: match(state.sleep, {
          ALLOW_SLEEP: () => sleepStates.PREVENT_SLEEP(),
          PREVENT_SLEEP: () => sleepStates.ALLOW_SLEEP(),
        }),
      }),
      ADD_GROCERY: (state) =>
        states.LIST({
          ...state,
          filter: filterStates.UNFILTERED(),
        }),
      GROCERY_INPUT_CHANGED: (state, { input }) =>
        states.LIST({
          ...state,
          filter: input
            ? filterStates.FILTERED(input)
            : filterStates.UNFILTERED(),
        }),
    },
  });

export const useGroceriesShopping = ({
  user,
  initialState,
}: {
  user: User;
  initialState?: State;
}) => {
  const storeGrocery = useStoreGrocery(user);
  const createGroceryId = useCreateGroceryId(user);
  const deleteGrocery = useDeleteGrocery(user);
  const groceriesShoppingReducer = useReducer(
    reducer,
    initialState ||
      states.LIST({
        sleep: sleepStates.ALLOW_SLEEP(),
        filter: filterStates.UNFILTERED(),
      })
  );

  useDevtools("GroceriesShopping", groceriesShoppingReducer);

  const [state, dispatch] = groceriesShoppingReducer;

  useTransition(state, "LIST => ADD_GROCERY => LIST", (_, __, { filter }) => {
    storeGrocery({
      id: createGroceryId(),
      name: filter.input,
    });
  });

  useTransition(state, "LIST => SHOP_GROCERY => LIST", (_, { groceryId }) => {
    deleteGrocery(groceryId);
  });

  return [state, actions(dispatch)] as const;
};
