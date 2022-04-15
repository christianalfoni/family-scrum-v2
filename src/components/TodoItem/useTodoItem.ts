import { StatesReducer, useCommandEffect } from "react-states";
import {
  createReducer,
  useEnvironment,
  useReducer,
} from "../../environment-interface";
import { FamilyUserDTO } from "../../environment-interface/authentication";
import { TodoDTO } from "../../environment-interface/storage";

type AddCheckListItemState =
  | {
      state: "INACTIVE";
    }
  | {
      state: "ACTIVE";
      newItemTitle: string;
    };

type CheckListState =
  | {
      state: "COLLAPSED";
    }
  | {
      state: "EXPANDED";
      addCheckListItem: AddCheckListItemState;
    };

type State =
  | {
      state: "TODO";
    }
  | {
      state: "TODO_WITH_CHECKLIST";
      checkList: CheckListState;
    };

type Action =
  | {
      type: "ARCHIVE_TODO";
    }
  | {
      type: "TOGGLE_CHECKLIST_ITEM";
      itemId: string;
    }
  | {
      type: "DELETE_CHECKLIST_ITEM";
      itemId: string;
    }
  | {
      type: "ADD_CHECKLIST_ITEM";
    }
  | {
      type: "TOGGLE_SHOW_CHECKLIST";
    }
  | {
      type: "CHANGE_NEW_CHECKLIST_ITEM_TITLE";
      title: string;
    }
  | {
      type: "SHOW_ADD_CHECKLIST_ITEM";
    };

type Command =
  | {
      cmd: "TOGGLE_CHECKLIST_ITEM";
      itemId: string;
    }
  | {
      cmd: "DELETE_CHECKLIST_ITEM";
      itemId: string;
    }
  | {
      cmd: "ADD_CHECKLIST_ITEM";
      title: string;
    }
  | {
      cmd: "ARCHIVE_TODO";
    };

type TodoItemReducer = StatesReducer<State, Action, Command>;

const reducer = createReducer<TodoItemReducer>({
  TODO: {
    ARCHIVE_TODO: ({ state, transition }) =>
      transition(state, {
        cmd: "ARCHIVE_TODO",
      }),
  },
  TODO_WITH_CHECKLIST: {
    ARCHIVE_TODO: ({ state, transition }) =>
      transition(state, {
        cmd: "ARCHIVE_TODO",
      }),
    TOGGLE_CHECKLIST_ITEM: ({ state, action: { itemId }, transition }) =>
      transition(state, {
        cmd: "TOGGLE_CHECKLIST_ITEM",
        itemId,
      }),
    DELETE_CHECKLIST_ITEM: ({ state, action: { itemId }, transition }) =>
      transition(state, {
        cmd: "DELETE_CHECKLIST_ITEM",
        itemId,
      }),
    ADD_CHECKLIST_ITEM: ({ state, transition, noop }) =>
      state.checkList.state === "EXPANDED" &&
      state.checkList.addCheckListItem.state === "ACTIVE" &&
      state.checkList.addCheckListItem.newItemTitle
        ? transition(
            {
              ...state,
              checkList: {
                state: "EXPANDED",
                addCheckListItem: {
                  state: "INACTIVE",
                },
              },
            },
            {
              cmd: "ADD_CHECKLIST_ITEM",
              title: state.checkList.addCheckListItem.newItemTitle,
            }
          )
        : noop(),
    CHANGE_NEW_CHECKLIST_ITEM_TITLE: ({
      state,
      action: { title },
      transition,
      noop,
    }) =>
      state.checkList.state === "EXPANDED" &&
      state.checkList.addCheckListItem.state === "ACTIVE"
        ? transition({
            ...state,
            checkList: {
              ...state.checkList,
              addCheckListItem: {
                ...state.checkList.addCheckListItem,
                newItemTitle: title,
              },
            },
          })
        : noop(),
    TOGGLE_SHOW_CHECKLIST: ({ state, transition }) =>
      state.checkList.state === "COLLAPSED"
        ? transition({
            ...state,
            checkList: {
              state: "EXPANDED",
              addCheckListItem: {
                state: "INACTIVE",
              },
            },
          })
        : transition({
            ...state,
            checkList: {
              state: "COLLAPSED",
            },
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
  const { storage } = useEnvironment();
  const todoItemReducer = useReducer(
    "TodoItem-" + todo.id,
    reducer,
    initialState || todo.checkList
      ? {
          state: "TODO_WITH_CHECKLIST",
          checkList: {
            state: "COLLAPSED",
          },
        }
      : {
          state: "TODO",
        }
  );

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
    storage.storeChecklistItem({
      id: storage.createCheckListItemId(),
      todoId: todo.id,
      title,
    });
  });

  return todoItemReducer;
};
