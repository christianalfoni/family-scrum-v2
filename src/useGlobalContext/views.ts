import { produce } from "immer";
import { signal } from "impact-app";
import { DinnerDTO, TodoDTO } from "./firebase";

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
      dinner?: DinnerDTO;
    }
  | {
      name: "EDIT_TODO";
      todo?: TodoDTO;
    };

/**
 * This is very much like a router, though since the app is used from the home
 * screen we use a stack of views instead
 */
export function useViews() {
  const views = signal<View[]>([
    {
      name: "DASHBOARD",
    },
  ]);

  return {
    get current() {
      return views.value[views.value.length - 1]!;
    },
    push(view: View) {
      views.value = produce(views.value, (draft) => {
        draft.push(view);
      });
    },
    replace(view: View) {
      views.value = produce(views.value, (draft) => {
        draft[draft.length - 1] = view;
      });
    },
    pop() {
      views.value = produce(views.value, (draft) => {
        draft.pop();
      });
    },
  };
}
