import { signal } from "impact-react";
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
export function createViews() {
  const views = signal<View[]>([
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
      views((current) => {
        current.push(view);
      });
    },
    replace(view: View) {
      views((current) => {
        current[current.length - 1] = view;
      });
    },
    pop() {
      views((current) => {
        current.pop();
      });
    },
  };
}
