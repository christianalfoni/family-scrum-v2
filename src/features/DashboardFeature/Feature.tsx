import { useReducer } from "react";
import {
  createContext,
  match,
  createHook,
  createReducer,
  useEnterEffect,
  useEvents,
  PickContext,
} from "react-states";
import { useEnvironment } from "../../environment";
import {
  BarcodeDTO,
  CheckListItemDTO,
  FamilyDTO,
  GroceryDTO,
  StorageEvent,
  TodoDTO,
  WeekDTO,
} from "../../environment/storage";
import { useSession, User } from "../SessionFeature";
import { useDevtools } from "react-states/devtools";
import { AuthenticationEvent } from "../../environment/authentication";
import { mod } from "../../utils";
import { getDay, isThisWeek } from "date-fns";

export type Barcodes = {
  [barcodeId: string]: BarcodeDTO;
};

export type Barcode = BarcodeDTO;

export type Family = FamilyDTO;

export type { User } from "../SessionFeature";

export type Grocery = GroceryDTO;

export type Groceries = {
  [groceryId: string]: Grocery;
};

export type Todo = TodoDTO;

export type CheckListItem = CheckListItemDTO;

export type CheckListItemsByTodoId = {
  [todoId: string]: {
    [itemId: string]: CheckListItem;
  };
};

export type ViewContext =
  | {
      state: "WEEKDAYS";
    }
  | {
      state: "GROCERIES_SHOPPING";
    }
  | {
      state: "GROCERIES";
    }
  | {
      state: "CHECKLISTS";
    }
  | {
      state: "PLAN_CURRENT_WEEK";
    }
  | {
      state: "PLAN_NEXT_WEEK";
    }
  | {
      state: "ADD_TODO";
    };

export type Todos = {
  [todoId: string]: Todo;
};

export type Week = WeekDTO;

export type WeekdayTodos = {
  [todoId: string]: string[];
};

type Context =
  | {
      state: "AWAITING_AUTHENTICATION";
    }
  | {
      state: "REQUIRING_AUTHENTICATION";
    }
  | {
      state: "LOADING";
      user: User;
      groceries?: Groceries;
      todos?: Todos;
      previousWeek?: Week;
      currentWeek?: Week;
      nextWeek?: Week;
      family?: Family;
      barcodes?: Barcodes;
      checkListItemsByTodoId?: CheckListItemsByTodoId;
    }
  | {
      state: "LOADED";
      family: Family;
      groceries: Groceries;
      todos: Todos;
      previousWeek: Week;
      currentWeek: Week;
      nextWeek: Week;
      view: ViewContext;
      user: User;
      barcodes: Barcodes;
      checkListItemsByTodoId: CheckListItemsByTodoId;
    }
  | {
      state: "ERROR";
      error: string;
    };

export type UIEvent =
  | {
      type: "VIEW_SELECTED";
      view: ViewContext;
    }
  | {
      type: "GROCERY_INPUT_CHANGED";
      input: string;
    }
  | {
      type: "ADD_GROCERY";
      name: string;
    };

type Event = UIEvent | AuthenticationEvent | StorageEvent;

const featureContext = createContext<Context, UIEvent>();

export const useFeature = createHook(featureContext);

const evaluateLoadedContext = (
  context: PickContext<Context, "LOADING">
): Context => {
  if (
    context.currentWeek &&
    context.nextWeek &&
    context.previousWeek &&
    context.groceries &&
    context.todos &&
    context.barcodes &&
    context.family &&
    context.checkListItemsByTodoId
  ) {
    return {
      state: "LOADED",
      view: {
        state: "WEEKDAYS",
      },
      barcodes: context.barcodes,
      currentWeek: context.currentWeek,
      family: context.family,
      groceries: context.groceries,
      nextWeek: context.nextWeek,
      previousWeek: context.previousWeek,
      todos: context.todos,
      user: context.user,
      checkListItemsByTodoId: context.checkListItemsByTodoId,
    };
  }

  return context;
};

const reducer = createReducer<Context, Event>({
  AWAITING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": ({ user }) => ({
      state: "LOADING",
      dataLoaded: {
        barcodes: false,
        events: false,
        family: false,
        groceries: false,
        todos: false,
        weeks: false,
      },
      user,
    }),
    "AUTHENTICATION:UNAUTHENTICATED": () => ({
      state: "REQUIRING_AUTHENTICATION",
    }),
  },
  REQUIRING_AUTHENTICATION: {
    "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY": ({ user }) => ({
      state: "LOADING",
      dataLoaded: {
        barcodes: false,
        events: false,
        family: false,
        groceries: false,
        todos: false,
        weeks: false,
      },
      user,
    }),
  },
  LOADING: {
    "STORAGE:FAMILY_UPDATE": ({ family }, context) =>
      evaluateLoadedContext({
        ...context,
        family,
      }),
    "STORAGE:WEEKS_UPDATE": (
      { previousWeek, currentWeek, nextWeek },
      context
    ) =>
      evaluateLoadedContext({
        ...context,
        previousWeek,
        currentWeek,
        nextWeek,
      }),
    "STORAGE:GROCERIES_UPDATE": ({ groceries }, context) =>
      evaluateLoadedContext({
        ...context,
        groceries,
      }),
    "STORAGE:TODOS_UPDATE": ({ todos }, context) =>
      evaluateLoadedContext({
        ...context,
        todos,
      }),
    "STORAGE:BARCODES_UPDATE": ({ barcodes }, context) =>
      evaluateLoadedContext({
        ...context,
        barcodes,
      }),
    "STORAGE:CHECKLIST_ITEMS_UPDATE": ({ checkListItemsByTodoId }, context) =>
      evaluateLoadedContext({
        ...context,
        checkListItemsByTodoId,
      }),
    "STORAGE:FETCH_WEEKS_ERROR": ({ error }) => ({
      state: "ERROR",
      error,
    }),
  },
  LOADED: {
    "STORAGE:FAMILY_UPDATE": ({ family }, context) => ({
      ...context,
      family,
    }),
    "STORAGE:GROCERIES_UPDATE": ({ groceries }, context) => ({
      ...context,
      groceries,
    }),
    "STORAGE:BARCODES_UPDATE": ({ barcodes }, context) => ({
      ...context,
      barcodes,
    }),
    "STORAGE:WEEKS_UPDATE": (
      { currentWeek, nextWeek, previousWeek },
      context
    ) => ({
      ...context,
      currentWeek,
      nextWeek,
      previousWeek,
    }),
    "STORAGE:TODOS_UPDATE": ({ todos }, context) => ({
      ...context,
      view:
        context.view.state === "ADD_TODO"
          ? {
              state: "WEEKDAYS",
            }
          : context.view,
      todos,
    }),
    "STORAGE:CHECKLIST_ITEMS_UPDATE": (
      { checkListItemsByTodoId },
      context
    ) => ({
      ...context,
      checkListItemsByTodoId,
    }),
    VIEW_SELECTED: ({ view }, context) => ({
      ...context,
      view,
    }),
  },
  ERROR: {},
});

export type Props = {
  children: React.ReactNode;
  initialContext?: Context;
};

export const selectors = {
  todosByWeekday: (week: Week) => {
    const todosByWeekday: [
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos,
      WeekdayTodos
    ] = [{}, {}, {}, {}, {}, {}, {}];

    for (let todoId in week.todos) {
      for (let userId in week.todos[todoId]) {
        week.todos[todoId][userId].forEach((isActive, index) => {
          if (isActive) {
            if (!todosByWeekday[index][todoId]) {
              todosByWeekday[index][todoId] = [];
            }
            todosByWeekday[index][todoId].push(userId);
          }
        });
      }
    }

    return todosByWeekday;
  },
  eventsByWeekday: (todos: Todos) => {
    const eventsByWeekday: [
      Todo[],
      Todo[],
      Todo[],
      Todo[],
      Todo[],
      Todo[],
      Todo[]
    ] = [[], [], [], [], [], [], []];

    Object.values(todos).forEach((todo) => {
      if (
        todo.date &&
        isThisWeek(todo.date, {
          weekStartsOn: 1,
        })
      ) {
        eventsByWeekday[mod(getDay(todo.date) - 1, 7)].push(todo);
      }
    });

    return eventsByWeekday.map((weekDay) =>
      weekDay.sort((a, b) => {
        if (a.date! > b.date!) {
          return 1;
        }
        if (a.date! < b.date!) {
          return -1;
        }

        return 0;
      })
    );
  },
  sortedTodos: (todos: Todos) =>
    Object.values(todos).sort((a, b) => {
      if (a.created < b.created) {
        return 1;
      } else if (a.created > b.created) {
        return -1;
      }

      return 0;
    }),
};

export const Feature = ({ children, initialContext }: Props) => {
  const { storage, authentication } = useEnvironment();
  const [session] = useSession();

  const matchSession = match(session);

  initialContext =
    initialContext ||
    matchSession<Context>({
      VERIFYING_AUTHENTICATION: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      SIGNING_IN: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      ERROR: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      NO_FAMILY: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      JOINING_FAMILY: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      CREATING_FAMILY: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
      SIGNED_IN: ({ user }) => ({
        state: "LOADING",
        dataLoaded: {
          barcodes: false,
          events: false,
          family: false,
          groceries: false,
          todos: false,
          weeks: false,
        },
        user,
      }),
      SIGNED_OUT: () => ({
        state: "REQUIRING_AUTHENTICATION",
      }),
      UPDATING_VERSION: () => ({
        state: "AWAITING_AUTHENTICATION",
      }),
    });

  const feature = useReducer(reducer, initialContext);

  if (process.env.NODE_ENV === "development" && process.browser) {
    useDevtools("Dashboard", feature);
  }

  const [context, send] = feature;

  useEvents(authentication.events, send);
  useEvents(storage.events, send);

  useEnterEffect(context, "LOADING", ({ user }) => {
    storage.fetchFamilyData(user.familyId);
    storage.fetchWeeks(user.familyId, user.id);
  });

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
