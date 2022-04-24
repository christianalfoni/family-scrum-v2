import { useReducer } from "react";
import {
  $COMMAND,
  IAction,
  ICommand,
  IState,
  match,
  pick,
  PickCommand,
  ReturnTypes,
  transition,
  TTransitions,
  useCommandEffect,
  useDevtools,
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
  ADD_CHECKLIST_ITEM: () => ({
    type: "ADD_CHECKLIST_ITEM" as const,
  }),
  TOGGLE_SHOW_CHECKLIST: () => ({
    type: "TOGGLE_SHOW_CHECKLIST" as const,
  }),
  CHANGE_NEW_CHECKLIST_ITEM_TITLE: (title: string) => ({
    type: "CHANGE_NEW_CHECKLIST_ITEM_TITLE" as const,
    title,
  }),
  SHOW_ADD_CHECKLIST_ITEM: () => ({
    type: "SHOW_ADD_CHECKLIST_ITEM" as const,
  }),
};

type Action = ReturnTypes<typeof actions, IAction>;

const commands = {
  TOGGLE_CHECKLIST_ITEM: (itemId: string) => ({
    cmd: "TOGGLE_CHECKLIST_ITEM" as const,
    itemId,
  }),
  DELETE_CHECKLIST_ITEM: (itemId: string) => ({
    cmd: "DELETE_CHECKLIST_ITEM" as const,
    itemId,
  }),
  ADD_CHECKLIST_ITEM: (title: string) => ({
    cmd: "ADD_CHECKLIST_ITEM" as const,
    title,
  }),
  ARCHIVE_TODO: () => ({
    cmd: "ARCHIVE_TODO" as const,
  }),
};

const addCheckListItemStates = {
  INACTIVE: () => ({
    state: "INACTIVE" as const,
  }),
  ACTIVE: (newItemTitle: string) => ({
    state: "ACTIVE" as const,
    newItemTitle,
  }),
};

type AddCheckListItemState = ReturnTypes<typeof addCheckListItemStates, IState>;

const checkListStates = {
  COLLAPSED: () => ({
    state: "COLLAPSED" as const,
  }),
  EXPANDED: (addCheckListItem: AddCheckListItemState) => ({
    state: "EXPANDED" as const,
    addCheckListItem,
  }),
};

type CheckListState = ReturnTypes<typeof checkListStates, IState>;

const states = {
  TODO: (command?: PickCommand<Command, "ARCHIVE_TODO">) => ({
    state: "TODO" as const,
    [$COMMAND]: command,
    ...pick(actions, "ARCHIVE_TODO"),
  }),
  TODO_WITH_CHECKLIST: (
    checkList: CheckListState,
    command?: PickCommand<
      Command,
      | "ARCHIVE_TODO"
      | "ADD_CHECKLIST_ITEM"
      | "DELETE_CHECKLIST_ITEM"
      | "TOGGLE_CHECKLIST_ITEM"
    >
  ) => ({
    state: "TODO_WITH_CHECKLIST" as const,
    checkList,
    [$COMMAND]: command,
    ...actions,
  }),
};

type State = ReturnTypes<typeof states, IState>;

type Command = ReturnTypes<typeof commands, ICommand>;

export const { TODO, TODO_WITH_CHECKLIST } = states;

const transitions: TTransitions<State, Action> = {
  TODO: {
    ARCHIVE_TODO: (state) => TODO(commands.ARCHIVE_TODO()),
  },
  TODO_WITH_CHECKLIST: {
    ARCHIVE_TODO: (state) =>
      TODO_WITH_CHECKLIST(state.checkList, commands.ARCHIVE_TODO()),
    TOGGLE_CHECKLIST_ITEM: (state, { itemId }) =>
      TODO_WITH_CHECKLIST(
        state.checkList,
        commands.TOGGLE_CHECKLIST_ITEM(itemId)
      ),
    DELETE_CHECKLIST_ITEM: (state, { itemId }) =>
      TODO_WITH_CHECKLIST(
        state.checkList,
        commands.DELETE_CHECKLIST_ITEM(itemId)
      ),
    ADD_CHECKLIST_ITEM: (state) =>
      match(state.checkList, {
        COLLAPSED: () => state,
        EXPANDED: ({ addCheckListItem }) =>
          match(addCheckListItem, {
            INACTIVE: () => state,
            ACTIVE: ({ newItemTitle }) =>
              TODO_WITH_CHECKLIST(
                checkListStates.EXPANDED(addCheckListItemStates.INACTIVE()),
                commands.ADD_CHECKLIST_ITEM(newItemTitle)
              ),
          }),
      }),
    CHANGE_NEW_CHECKLIST_ITEM_TITLE: (state, { title }) =>
      match(state.checkList, {
        COLLAPSED: () => state,
        EXPANDED: ({ addCheckListItem }) =>
          match(addCheckListItem, {
            INACTIVE: () => state,
            ACTIVE: ({ newItemTitle }) =>
              TODO_WITH_CHECKLIST(
                checkListStates.EXPANDED(addCheckListItemStates.ACTIVE(title))
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
            checkListStates.EXPANDED(addCheckListItemStates.ACTIVE(""))
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

  useCommandEffect(state, "ARCHIVE_TODO", () => {
    storage.archiveTodo(todo.id);
  });

  useCommandEffect(state, "TOGGLE_CHECKLIST_ITEM", ({ itemId }) => {
    storage.toggleCheckListItem(user.id, itemId);
  });

  useCommandEffect(state, "DELETE_CHECKLIST_ITEM", ({ itemId }) => {
    storage.deleteChecklistItem(itemId);
  });

  useCommandEffect(state, "ADD_CHECKLIST_ITEM", ({ title }) => {
    storage.addChecklistItem({
      id: storage.createCheckListItemId(),
      todoId: todo.id,
      title,
    });
  });

  return todoItemReducer;
};
