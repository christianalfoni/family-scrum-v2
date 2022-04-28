import { FamilyUserDTO } from "../../../environment-interface/authentication";
import {
  CheckListItemsByTodoId,
  DinnerDTO,
  FamilyDTO,
  GroceryDTO,
  TodoDTO,
  WeekDTO,
} from "../../../environment-interface/storage";
import { actions } from "./actions";

export type Data = {
  groceries: Record<string, GroceryDTO>;
  todos: Record<string, TodoDTO>;
  previousWeek: WeekDTO;
  currentWeek: WeekDTO;
  nextWeek: WeekDTO;
  dinners: Record<string, DinnerDTO>;
  family: FamilyDTO;
  checkListItemsByTodoId: CheckListItemsByTodoId;
};

export const viewStates = {
  DASHBOARD: () => ({
    state: "DASHBOARD" as const,
  }),
  GROCERIES_SHOPPING: () => ({
    state: "GROCERIES_SHOPPING" as const,
  }),
  CHECKLISTS: () => ({
    state: "CHECKLISTS" as const,
  }),
  PLAN_NEXT_WEEK: (subView: "DINNERS" | "TODOS") => ({
    state: "PLAN_NEXT_WEEK" as const,
    subView,
  }),
  DINNERS: () => ({
    state: "DINNERS" as const,
  }),
  EDIT_DINNER: (id?: string) => ({
    state: "EDIT_DINNER" as const,
    id,
  }),
  EDIT_TODO: (id?: string) => ({
    state: "EDIT_TODO" as const,
    id,
  }),
};

export type ViewState = ReturnType<typeof viewStates[keyof typeof viewStates]>;

type BaseState = {
  user: FamilyUserDTO;
  data: Data;
  viewStack: ViewState[];
};

const states = {
  AWAITING_AUTHENTICATION: () => ({
    state: "AWAITING_AUTHENTICATION" as const,
  }),
  REQUIRING_AUTHENTICATION: () => ({
    state: "REQUIRING_AUTHENTICATION" as const,
  }),
  LOADING: ({
    user,
    data,
  }: Pick<BaseState, "user"> & { data: Partial<Data> }) => ({
    state: "LOADING" as const,
    user,
    data,
  }),
  LOADED: ({ user, data, viewStack }: BaseState) => ({
    state: "LOADED" as const,
    user,
    data,
    viewStack,
    ...actions,
  }),
  ERROR: ({ error }: { error: string }) => ({
    state: "ERROR" as const,
    error,
  }),
};

export type State = ReturnType<typeof states[keyof typeof states]>;

export const {
  AWAITING_AUTHENTICATION,
  ERROR,
  LOADED,
  LOADING,
  REQUIRING_AUTHENTICATION,
} = states;
