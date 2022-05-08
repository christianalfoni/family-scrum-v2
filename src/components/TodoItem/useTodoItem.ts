import { useReducer } from "react";
import {
  match,
  transition,
  TTransitions,
  useDevtools,
  useTransitionEffect,
} from "react-states";
import { useEnvironment } from "../../environment-interface";
import { FamilyUserDTO } from "../../environment-interface/authentication";
import { TodoDTO } from "../../environment-interface/storage";

const actions = {
  ARCHIVE_TODO: () => ({
    type: "ARCHIVE_TODO" as const,
  }),
  TOGGLE_CHECKLIST_ITEM: (itemId: string) => ({
    type: "TOGGLE_CHECKLIST_ITEM" as const,
    itemId,
  }),
  DELETE_CHECKLIST_ITEM: (itemId: string) => ({
    type: "DELETE_CHECKLIST_ITEM" as const,
    itemId,
  }),
  ADD_CHECKLIST_ITEM: (title: string) => ({
    type: "ADD_CHECKLIST_ITEM" as const,
    title,
  }),
  TOGGLE_SHOW_CHECKLIST: () => ({
    type: "TOGGLE_SHOW_CHECKLIST" as const,
  }),
  SHOW_ADD_CHECKLIST_ITEM: () => ({
    type: "SHOW_ADD_CHECKLIST_ITEM" as const,
  }),
};

type Action = ReturnType<typeof actions[keyof typeof actions]>;

const addCheckListItemStates = {
  INACTIVE: () => ({
    state: "INACTIVE" as const,
    SHOW_ADD_CHECKLIST_ITEM: actions.SHOW_ADD_CHECKLIST_ITEM,
  }),
  ACTIVE: () => ({
    state: "ACTIVE" as const,
    ADD_CHECKLIST_ITEM: actions.ADD_CHECKLIST_ITEM,
  }),
};

type AddCheckListItemState = ReturnType<
  typeof addCheckListItemStates[keyof typeof addCheckListItemStates]
>;

const checkListStates = {
  COLLAPSED: () => ({
    state: "COLLAPSED" as const,
  }),
  EXPANDED: (addCheckListItem: AddCheckListItemState) => ({
    state: "EXPANDED" as const,
    addCheckListItem,
    TOGGLE_CHECKLIST_ITEM: actions.TOGGLE_CHECKLIST_ITEM,
    DELETE_CHECKLIST_ITEM: actions.DELETE_CHECKLIST_ITEM,
  }),
};

type CheckListState = ReturnType<
  typeof checkListStates[keyof typeof checkListStates]
>;

const states = {
  TODO: () => ({
    state: "TODO" as const,
    ARCHIVE_TODO: actions.ARCHIVE_TODO,
  }),
  TODO_WITH_CHECKLIST: (checkList: CheckListState) => ({
    state: "TODO_WITH_CHECKLIST" as const,
    checkList,
    TOGGLE_SHOW_CHECKLIST: actions.TOGGLE_SHOW_CHECKLIST,
    ARCHIVE_TODO: actions.ARCHIVE_TODO,
  }),
};

type State = ReturnType<typeof states[keyof typeof states]>;

export const { TODO, TODO_WITH_CHECKLIST } = states;

const transitions: TTransitions<State, Action> = {
  TODO: {
    ARCHIVE_TODO: () => TODO(),
  },
  TODO_WITH_CHECKLIST: {
    ARCHIVE_TODO: (state) => TODO_WITH_CHECKLIST(state.checkList),
    TOGGLE_CHECKLIST_ITEM: (state) =>
      match(state.checkList, {
        COLLAPSED: () => state,
        EXPANDED: () => TODO_WITH_CHECKLIST(state.checkList),
      }),
    DELETE_CHECKLIST_ITEM: (state) => TODO_WITH_CHECKLIST(state.checkList),
    ADD_CHECKLIST_ITEM: (state) =>
      match(state.checkList, {
        COLLAPSED: () => state,
        EXPANDED: ({ addCheckListItem }) =>
          match(addCheckListItem, {
            INACTIVE: () => state,
            ACTIVE: () =>
              TODO_WITH_CHECKLIST(
                checkListStates.EXPANDED(addCheckListItemStates.INACTIVE())
              ),
          }),
      }),
    TOGGLE_SHOW_CHECKLIST: (state) =>
      match(state.checkList, {
        COLLAPSED: () =>
          TODO_WITH_CHECKLIST(
            checkListStates.EXPANDED(addCheckListItemStates.INACTIVE())
          ),
        EXPANDED: () => TODO_WITH_CHECKLIST(checkListStates.COLLAPSED()),
      }),
    SHOW_ADD_CHECKLIST_ITEM: (state) =>
      match(state.checkList, {
        COLLAPSED: () => state,
        EXPANDED: () =>
          TODO_WITH_CHECKLIST(
            checkListStates.EXPANDED(addCheckListItemStates.ACTIVE())
          ),
      }),
  },
};

const reducer = (state: State, action: Action) =>
  transition(state, action, transitions);

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
    initialState || todo.checkList
      ? TODO_WITH_CHECKLIST(checkListStates.COLLAPSED())
      : TODO()
  );

  useDevtools("TodoItem-" + todo.id, todoItemReducer);

  const [state] = todoItemReducer;

  useTransitionEffect(
    state,
    ["TODO", "TODO_WITH_CHECKLIST"],
    "ARCHIVE_TODO",
    () => {
      storage.archiveTodo(todo.id);
    }
  );

  useTransitionEffect(
    state,
    "TODO_WITH_CHECKLIST",
    "TOGGLE_CHECKLIST_ITEM",
    (_, { itemId }) => {
      storage.toggleCheckListItem(user.id, itemId);
    }
  );

  useTransitionEffect(
    state,
    "TODO_WITH_CHECKLIST",
    "DELETE_CHECKLIST_ITEM",
    (_, { itemId }) => {
      storage.deleteChecklistItem(itemId);
    }
  );

  useTransitionEffect(
    state,
    "TODO_WITH_CHECKLIST",
    "ADD_CHECKLIST_ITEM",
    (_, { title }) => {
      storage.addChecklistItem({
        id: storage.createCheckListItemId(),
        todoId: todo.id,
        title,
      });
    }
  );

  return todoItemReducer;
};
