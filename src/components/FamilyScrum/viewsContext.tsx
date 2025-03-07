import { reactive } from "bonsify";
import { createContext, useContext } from "react";

export type View =
  | {
      name: "dashboard";
    }
  | {
      name: "groceries";
    }
  | {
      name: "edit_dinner";
      dinnerId: string;
    };

export type Views = {
  current: View;
  push(view: View): void;
  pop(): void;
};

const viewsContext = createContext(null as unknown as Views);

export function createViewsProvider() {
  const viewStack = reactive<View[]>([
    {
      name: "dashboard",
    },
  ]);

  const views: Views = {
    get current() {
      return viewStack[viewStack.length - 1];
    },
    push(view) {
      viewStack.push(view);
    },
    pop() {
      viewStack.pop();
    },
  };

  return ({ children }: { children: React.ReactNode }) => (
    <viewsContext.Provider value={views}>{children}</viewsContext.Provider>
  );
}

export const useViews = () => {
  const views = useContext(viewsContext);

  if (!views) {
    throw new Error("Can not use views outside of views provider");
  }

  return views;
};
