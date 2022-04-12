import { createContext, useContext } from "react";
import {
  StatesReducer,
  StatesTransition,
  useCommandEffect,
} from "react-states";
import {
  createReducer,
  useEnvironment,
  useReducer,
} from "../../environment-interface";
import { FamilyUserDTO } from "../../environment-interface/authentication";

import { CheckListItem, Todos } from "../DashboardFeature/Feature";

type State = {
  state: "LIST";
};

type Action =
  | {
      type: "ARCHIVE_TODO";
      todoId: string;
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
      title: string;
      todoId: string;
    };

type Command =
  | {
      cmd: "ARCHIVE_TODO";
      todoId: string;
    }
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
      todoId: string;
    };

type CheckListFeature = StatesReducer<State, Action, Command>;

type Transition = StatesTransition<CheckListFeature>;

const featureContext = createContext({} as CheckListFeature);

const reducer = createReducer<CheckListFeature>({
  LIST: {
    ARCHIVE_TODO: (state, { todoId }): Transition => [
      state,
      {
        cmd: "ARCHIVE_TODO",
        todoId,
      },
    ],
    TOGGLE_CHECKLIST_ITEM: (state, { itemId }): Transition => [
      state,
      {
        cmd: "TOGGLE_CHECKLIST_ITEM",
        itemId,
      },
    ],
    DELETE_CHECKLIST_ITEM: (state, { itemId }): Transition => [
      state,
      {
        cmd: "DELETE_CHECKLIST_ITEM",
        itemId,
      },
    ],
    ADD_CHECKLIST_ITEM: (state, { title, todoId }): Transition => [
      state,
      {
        cmd: "ADD_CHECKLIST_ITEM",
        title,
        todoId,
      },
    ],
  },
});

export const useFeature = () => useContext(featureContext);

export const selectors = {
  sortedCheckListItems(checkListItems: { [itemId: string]: CheckListItem }) {
    return Object.values(checkListItems).sort((a, b) => {
      if (a.created > b.created) {
        return 1;
      }
      if (a.created < b.created) {
        return -1;
      }

      return 0;
    });
  },
  checkLists: (todos: Todos) =>
    Object.values(todos).filter((todo) => Boolean(todo.checkList)),
};

export const Feature = ({
  user,
  children,
  initialContext = {
    state: "LIST",
  },
}: {
  user: FamilyUserDTO;
  children: React.ReactNode;
  initialContext?: State;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer("CheckList", reducer, initialContext);

  const [context, send] = feature;

  useCommandEffect(context, "ARCHIVE_TODO", ({ todoId }) => {
    storage.archiveTodo(user.familyId, todoId);
  });

  useCommandEffect(context, "TOGGLE_CHECKLIST_ITEM", ({ itemId }) => {
    storage.toggleCheckListItem(user.familyId, user.id, itemId);
  });

  useCommandEffect(context, "DELETE_CHECKLIST_ITEM", ({ itemId }) => {
    storage.deleteChecklistItem(user.familyId, itemId);
  });

  useCommandEffect(context, "ADD_CHECKLIST_ITEM", ({ title, todoId }) => {
    storage.addChecklistItem(user.familyId, todoId, title);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
