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
import { FamilyUserDTO } from "../../environment-interface/authentication";
import { TodoDTO } from "../../environment-interface/storage";

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

const states = createStates({
  TODO: (checkList: CheckListState) => ({
    checkList,
  }),
});

type State = StatesUnion<typeof states>;

const reducer = (prevState: State, action: Action) =>
  transition(prevState, action, {
    TODO: {
      ARCHIVE_TODO: (state) => states.TODO(state.checkList),
      TOGGLE_CHECKLIST_ITEM: (state) =>
        match(state.checkList, {
          COLLAPSED: () => state,
          EXPANDED: () => states.TODO(state.checkList),
        }),
      DELETE_CHECKLIST_ITEM: (state) => states.TODO(state.checkList),
      ADD_CHECKLIST_ITEM: (state) =>
        match(state.checkList, {
          COLLAPSED: () => state,
          EXPANDED: ({ addCheckListItem }) =>
            match(addCheckListItem, {
              INACTIVE: () => state,
              ACTIVE: () =>
                states.TODO(
                  checkListStates.EXPANDED(addCheckListItemStates.INACTIVE())
                ),
            }),
        }),
      TOGGLE_SHOW_CHECKLIST: (state) =>
        match(state.checkList, {
          COLLAPSED: () =>
            states.TODO(
              checkListStates.EXPANDED(addCheckListItemStates.INACTIVE())
            ),
          EXPANDED: () => states.TODO(checkListStates.COLLAPSED()),
        }),
      SHOW_ADD_CHECKLIST_ITEM: (state) =>
        match(state.checkList, {
          COLLAPSED: () => state,
          EXPANDED: () =>
            states.TODO(
              checkListStates.EXPANDED(addCheckListItemStates.ACTIVE())
            ),
        }),
      SHOP_GROCERY: (state) => states.TODO(state.checkList),
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
  const { storage } = useEnvironment();
  const todoItemReducer = useReducer(
    reducer,
    initialState || states.TODO(checkListStates.COLLAPSED())
  );

  useDevtools("TodoItem-" + todo.id, todoItemReducer);

  const [state, dispatch] = todoItemReducer;

  useTransition(state, "TODO => ARCHIVE_TODO => TODO", () => {
    storage.archiveTodo(todo.id);
  });

  useTransition(
    state,
    "TODO => TOGGLE_CHECKLIST_ITEM => TODO",
    (_, { itemId }) => {
      storage.toggleCheckListItem(user.id, itemId);
    }
  );

  useTransition(
    state,
    "TODO => DELETE_CHECKLIST_ITEM => TODO",
    (_, { itemId }) => {
      storage.deleteChecklistItem(itemId);
    }
  );

  useTransition(state, "TODO => ADD_CHECKLIST_ITEM => TODO", (_, { title }) => {
    storage.addChecklistItem({
      id: storage.createCheckListItemId(),
      todoId: todo.id,
      title,
    });
  });

  useTransition(state, "TODO => SHOP_GROCERY => TODO", (_, { grocery }) => {
    storage.storeGrocery({
      id: storage.createGroceryId(),
      name: grocery,
    });
  });

  return [state, actions(dispatch)] as const;
};
