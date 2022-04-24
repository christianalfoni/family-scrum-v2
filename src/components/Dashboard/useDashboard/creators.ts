import { IAction, IState, ReturnTypes } from "react-states";
import { FamilyUserDTO } from "../../../environment-interface/authentication";
import {
  CheckListItemsByTodoId,
  DinnerDTO,
  FamilyDTO,
  GroceryDTO,
  TodoDTO,
  WeekDTO,
} from "../../../environment-interface/storage";

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

const actions = {
  PUSH_VIEW: (view: ViewState) => ({
    type: "PUSH_VIEW" as const,
    view,
  }),
  POP_VIEW: () => ({
    type: "POP_VIEW" as const,
  }),
  REPLACE_VIEW: (view: ViewState) => ({
    type: "REPLACE_VIEW" as const,
    view,
  }),
};

export type Action = ReturnTypes<typeof actions, IAction>;

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

export type ViewState = ReturnTypes<typeof viewStates, IState>;

const states = {
  AWAITING_AUTHENTICATION: () => ({
    state: "AWAITING_AUTHENTICATION" as const,
  }),
  REQUIRING_AUTHENTICATION: () => ({
    state: "REQUIRING_AUTHENTICATION" as const,
  }),
  LOADING: (params: { user: FamilyUserDTO; data: Partial<Data> }) => ({
    state: "LOADING" as const,
    ...params,
  }),
  LOADED: (params: {
    user: FamilyUserDTO;
    data: Data;
    viewStack: ViewState[];
  }) => ({
    state: "LOADED" as const,
    ...params,
    ...actions,
  }),
  ERROR: (params: { error: string }) => ({
    state: "ERROR" as const,
    ...params,
  }),
};

export type State = ReturnTypes<typeof states, IState>;

export const {
  AWAITING_AUTHENTICATION,
  ERROR,
  LOADED,
  LOADING,
  REQUIRING_AUTHENTICATION,
} = states;
