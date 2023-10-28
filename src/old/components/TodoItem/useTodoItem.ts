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

import {
  useAddCheckListItem,
  useDeleteCheckListItem,
  useToggleCheckListItem,
} from "../../hooks/useCheckListItems";
import { useCreateGroceryId, useStoreGrocery } from "../../hooks/useGroceries";
import { useArchiveTodo } from "../../hooks/useTodos";
import { FamilyUserDTO, TodoDTO } from "../../types";

const actions = createActions({
  ARCHIVE_TODO: () => ({}),
  SHOP_GROCERY: (grocery: string) => ({ grocery }),
  TOGGLE_CHECKLIST_ITEM: (itemId: string) => ({
    itemId,
  }),
  DELETE_CHECKLIST_ITEM: (itemId: string) => ({
    itemId,
  }),
  ADD_CHECKLIST_ITEM: (title: string) => ({
    title,
  }),
  TOGGLE_SHOW_CHECKLIST: () => ({}),
  SHOW_ADD_CHECKLIST_ITEM: () => ({}),
});

type Action = ActionsUnion<typeof actions>;

const addCheckListItemStates = createStates({
  INACTIVE: () => ({}),
  ACTIVE: () => ({}),
});

type AddCheckListItemState = StatesUnion<typeof addCheckListItemStates>;

const checkListStates = createStates({
  COLLAPSED: () => ({}),
  EXPANDED: (addCheckListItem: AddCheckListItemState) => ({
    addCheckListItem,
  }),
});

type CheckListState = StatesUnion<typeof checkListStates>;

const groceryStates = createStates({
  INACTIVE: () => ({}),
  ACTIVE: (grocery: string) => ({ grocery }),
  DISABLED: (grocery: string) => ({
    grocery,
  }),
});

type GroceryState = StatesUnion<typeof groceryStates>;

const states = createStates({
  EDITING: ({
    checkList,
    grocery,
  }: {
    checkList: CheckListState;
    grocery: GroceryState;
  }) => ({
    checkList,
    grocery,
  }),
});

type State = StatesUnion<typeof states>;

const reducer = (prevState: State, action: Action) =>
  transition(prevState, action, {
    EDITING: {
      ARCHIVE_TODO: ({ checkList, grocery }) =>
        states.EDITING({ checkList, grocery }),
      TOGGLE_CHECKLIST_ITEM: (state) =>
        match(state.checkList, {
          COLLAPSED: () => state,
          EXPANDED: () => states.EDITING(state),
        }),
      DELETE_CHECKLIST_ITEM: states.EDITING,
      ADD_CHECKLIST_ITEM: (state) =>
        match(state.checkList, {
          COLLAPSED: () => state,
          EXPANDED: ({ addCheckListItem }) =>
            match(addCheckListItem, {
              INACTIVE: () => state,
              ACTIVE: () =>
                states.EDITING({
                  checkList: checkListStates.EXPANDED(
                    addCheckListItemStates.INACTIVE()
                  ),
                  grocery: state.grocery,
                }),
            }),
        }),
      TOGGLE_SHOW_CHECKLIST: ({ checkList, grocery }) =>
        match(checkList, {
          COLLAPSED: () =>
            states.EDITING({
              checkList: checkListStates.EXPANDED(
                addCheckListItemStates.INACTIVE()
              ),
              grocery,
            }),
          EXPANDED: () =>
            states.EDITING({ checkList: checkListStates.COLLAPSED(), grocery }),
        }),
      SHOW_ADD_CHECKLIST_ITEM: (state) =>
        match(state.checkList, {
          COLLAPSED: () => state,
          EXPANDED: () =>
            states.EDITING({
              checkList: checkListStates.EXPANDED(
                addCheckListItemStates.ACTIVE()
              ),
              grocery: state.grocery,
            }),
        }),
      SHOP_GROCERY: (state) =>
        match(state.grocery, {
          INACTIVE: () => state,
          ACTIVE: ({ grocery }) =>
            states.EDITING({
              checkList: state.checkList,
              grocery: groceryStates.DISABLED(grocery),
            }),
          DISABLED: () => state,
        }),
    },
  });

export const useTodoItem = ({
  user,
  todo,
  initialState,
}: {
  user: FamilyUserDTO;
  todo: TodoDTO;
  initialState?: State;
}) => {
  const archiveTodo = useArchiveTodo(user);
  const toggleCheckListItem = useToggleCheckListItem(user);
  const deleteChecklistItem = useDeleteCheckListItem(user);
  const addCheckListItem = useAddCheckListItem(user);
  const storeGrocery = useStoreGrocery(user);
  const createGroceryId = useCreateGroceryId(user);
  const todoItemReducer = useReducer(
    reducer,
    initialState ||
      states.EDITING({
        checkList: checkListStates.COLLAPSED(),
        grocery: groceryStates.INACTIVE(),
      })
  );

  useDevtools("TodoItem-" + todo.id, todoItemReducer);

  const [state, dispatch] = todoItemReducer;

  useTransition(state, "EDITING => ARCHIVE_TODO => EDITING", () => {
    archiveTodo(todo.id);
  });

  useTransition(
    state,
    "EDITING => TOGGLE_CHECKLIST_ITEM => EDITING",
    (_, { itemId }) => {
      toggleCheckListItem(itemId);
    }
  );

  useTransition(
    state,
    "EDITING => DELETE_CHECKLIST_ITEM => EDITING",
    (_, { itemId }) => {
      deleteChecklistItem(itemId);
    }
  );

  useTransition(
    state,
    "EDITING => ADD_CHECKLIST_ITEM => EDITING",
    (_, { title }) => {
      addCheckListItem(todo.id, title);
    }
  );

  useTransition(
    state,
    "EDITING => SHOP_GROCERY => EDITING",
    (_, { grocery }) => {
      storeGrocery({
        id: createGroceryId(),
        name: grocery,
      });
    }
  );

  return [state, actions(dispatch)] as const;
};
