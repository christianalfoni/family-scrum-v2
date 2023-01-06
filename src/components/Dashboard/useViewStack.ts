import { useReducer } from "react";

export type View =
  | {
      name: "DASHBOARD";
    }
  | {
      name: "GROCERIES_SHOPPING";
    }
  | {
      name: "CHECKLISTS";
    }
  | {
      name: "PLAN_NEXT_WEEK";
      subView: "DINNERS" | "TODOS";
    }
  | {
      name: "DINNERS";
    }
  | {
      name: "EDIT_DINNER";
      id?: string;
    }
  | {
      name: "EDIT_TODO";
      id?: string;
    };

export type ViewState = View[];

export type ViewAction =
  | {
      type: "PUSH_VIEW";
      view: View;
    }
  | {
      type: "REPLACE_VIEW";
      view: View;
    }
  | {
      type: "POP_VIEW";
    };

export const useViewStack = () =>
  useReducer(
    (state: ViewState, action: ViewAction) => {
      switch (action.type) {
        case "PUSH_VIEW": {
          return state.concat(action.view);
        }
        case "REPLACE_VIEW": {
          return [...state.slice(0, state.length - 1), action.view];
        }
        case "POP_VIEW": {
          return state.slice(0, state.length - 1);
        }
      }
    },
    [
      {
        name: "DASHBOARD",
      },
    ]
  );
