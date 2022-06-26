import { createStates, StatesUnion } from "react-states";
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

export const viewStates = createStates({
  DASHBOARD: () => ({}),
  GROCERIES_SHOPPING: () => ({}),
  CHECKLISTS: () => ({}),
  PLAN_NEXT_WEEK: (subView: "DINNERS" | "TODOS") => ({
    subView,
  }),
  DINNERS: () => ({}),
  EDIT_DINNER: (id?: string) => ({
    id,
  }),
  EDIT_TODO: (id?: string) => ({
    id,
  }),
});

export type ViewState = StatesUnion<typeof viewStates>;

type BaseState = {
  user: FamilyUserDTO;
  data: Data;
  viewStack: ViewState[];
};

export const states = createStates({
  AWAITING_AUTHENTICATION: () => ({}),
  REQUIRING_AUTHENTICATION: () => ({}),
  LOADING: ({
    user,
    data,
  }: Pick<BaseState, "user"> & { data: Partial<Data> }) => ({
    user,
    data,
  }),
  LOADED: ({ user, data, viewStack }: BaseState) => ({
    user,
    data,
    viewStack,
  }),
  ERROR: ({ error }: { error: string }) => ({
    error,
  }),
});

export type State = StatesUnion<typeof states>;
