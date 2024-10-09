import { produce } from "immer";
import { DinnerDTO, TodoDTO } from "./firebase";
import { signal } from "@impact-react/signals";

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
  const [views, setViews] = signal<View[]>([
    {
      name: "DASHBOARD",
    },
  ]);

  return {
    get current() {
      const currentViews = views();

      return currentViews[currentViews.length - 1]!;
    },
    push(view: View) {
      setViews(
        produce((draft) => {
          draft.push(view);
        })
      );
    },
    replace(view: View) {
      setViews(
        produce((draft) => {
          draft[draft.length - 1] = view;
        })
      );
    },
    pop() {
      setViews(
        produce((draft) => {
          draft.pop();
        })
      );
    },
  };
}
