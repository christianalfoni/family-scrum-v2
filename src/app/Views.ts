import { createSignal } from "@/ratchit";

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

export class Views {
  #views = createSignal<View[]>([
    {
      name: "DASHBOARD",
    },
  ]);

  get current() {
    const views = this.#views.get();

    return views[views.length - 1]!;
  }

  push(view: View) {
    this.#views.update((views) => {
      views.push(view);
    });
  }
  replace(view: View) {
    this.#views.update((views) => {
      views[views.length - 1] = view;
    });
  }
  pop() {
    this.#views.update((views) => {
      views.pop();
    });
  }
}
