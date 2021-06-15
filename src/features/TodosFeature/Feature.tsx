import { useReducer } from "react";
import {
  createContext,
  createHook,
  createReducer,
  useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { StorageEvent } from "../../environment/storage";
import { User } from "../SessionFeature";

type Context = {
  state: "LIST";
};

type TransientContext =
  | {
      state: "ARCHIVING_TODO";
      todoId: string;
    }
  | {
      state: "TOGGLING_CHECKLIST_ITEM";
      itemId: string;
    }
  | {
      state: "DELETING_CHECKLIST_ITEM";
      itemId: string;
    }
  | {
      state: "ADDING_CHECKLIST_ITEM";
      title: string;
      todoId: string;
    };

type UIEvent =
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

type Event = UIEvent | StorageEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();

const reducer = createReducer<Context, Event, TransientContext>(
  {
    LIST: {
      ARCHIVE_TODO: ({ todoId }) => ({
        state: "ARCHIVING_TODO",
        todoId,
      }),
      TOGGLE_CHECKLIST_ITEM: ({ itemId }) => ({
        state: "TOGGLING_CHECKLIST_ITEM",
        itemId,
      }),
      DELETE_CHECKLIST_ITEM: ({ itemId }) => ({
        state: "DELETING_CHECKLIST_ITEM",
        itemId,
      }),
      ADD_CHECKLIST_ITEM: ({ title, todoId }) => ({
        state: "ADDING_CHECKLIST_ITEM",
        title,
        todoId,
      }),
    },
  },
  {
    ARCHIVING_TODO: (_, prevContext) => prevContext,
    TOGGLING_CHECKLIST_ITEM: (_, prevContext) => prevContext,
    DELETING_CHECKLIST_ITEM: (_, prevContext) => prevContext,
    ADDING_CHECKLIST_ITEM: (_, prevContext) => prevContext,
  }
);

export const useFeature = createHook(featureContext);

export const Feature = ({
  user,
  children,
  initialContext = {
    state: "LIST",
  },
}: {
  user: User;
  children: React.ReactNode;
  initialContext?: Context;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("Todos", feature);
  }

  const [context, send] = feature;

  useEnterEffect(context, "ARCHIVING_TODO", ({ todoId }) => {
    storage.archiveTodo(user.familyId, todoId);
  });

  useEnterEffect(context, "TOGGLING_CHECKLIST_ITEM", ({ itemId }) => {
    storage.toggleCheckListItem(user.familyId, user.id, itemId);
  });

  useEnterEffect(context, "DELETING_CHECKLIST_ITEM", ({ itemId }) => {
    storage.deleteChecklistItem(user.familyId, itemId);
  });

  useEnterEffect(context, "ADDING_CHECKLIST_ITEM", ({ title, todoId }) => {
    storage.addChecklistItem(user.familyId, todoId, title);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
