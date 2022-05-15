import { useReducer } from "react";
import {
  transition,
  TTransitions,
  useDevtools,
  useTransitionEffect,
} from "react-states";

import { useEnvironment } from "../../environment-interface";
import { FamilyUserDTO } from "../../environment-interface/authentication";

const actions = {
  TOGGLE_WEEKDAY: (params: {
    todoId: string;
    userId: string;
    weekdayIndex: number;
    active: boolean;
  }) => ({
    type: "TOGGLE_WEEKDAY" as const,
    ...params,
  }),
  CHANGE_WEEKDAY_DINNER: (params: {
    weekdayIndex: number;
    dinnerId: string | null;
  }) => ({
    type: "CHANGE_WEEKDAY_DINNER" as const,
    ...params,
  }),
};

type Action = ReturnType<typeof actions[keyof typeof actions]>;

const states = {
  PLANNING: ({ userId }: { userId: string }) => ({
    state: "PLANNING" as const,
    userId,

    ...actions,
  }),
};

type State = ReturnType<typeof states[keyof typeof states]>;

export const { PLANNING } = states;

const transitions: TTransitions<State, Action> = {
  PLANNING: {
    CHANGE_WEEKDAY_DINNER: (state, { dinnerId, weekdayIndex }) =>
      PLANNING(state),
    TOGGLE_WEEKDAY: (state, { userId }) =>
      userId === state.userId ? PLANNING(state) : state,
  },
};

const reducer = (state: State, action: Action) =>
  transition(state, action, transitions);

export const usePlanNextWeek = ({
  user,
  weekId,
  initialState,
}: {
  user: FamilyUserDTO;
  weekId: string;
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const planNextWeekReducer = useReducer(
    reducer,
    initialState || PLANNING({ userId: user.id })
  );

  useDevtools("PlanWeek", planNextWeekReducer);

  const [state] = planNextWeekReducer;

  useTransitionEffect(
    state,
    "PLANNING",
    "TOGGLE_WEEKDAY",
    ({ userId }, { todoId, weekdayIndex, active }) => {
      storage.setWeekTaskActivity({
        weekId,
        todoId,
        userId,
        active,
        weekdayIndex,
      });
    }
  );

  useTransitionEffect(
    state,
    "PLANNING",
    "CHANGE_WEEKDAY_DINNER",
    (_, { weekdayIndex, dinnerId }) => {
      storage.setWeekDinner({
        weekId,
        dinnerId,
        weekdayIndex,
      });
    }
  );

  return planNextWeekReducer;
};
