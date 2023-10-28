import { produce } from "immer";
import { signal, store } from "impact-app";

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

export function ViewStackStore() {
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

export const useViewStack = () => store(ViewStackStore);
