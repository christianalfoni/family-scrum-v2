import { useReducer } from "react";
import {
  $COMMAND,
  IAction,
  ICommand,
  IState,
  PickCommand,
  ReturnTypes,
  transition,
  TTransitions,
  useCommandEffect,
  useDevtools,
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

type Action = ReturnTypes<typeof actions, IAction>;

const commands = {
  TOGGLE_WEEKDAY: (params: {
    todoId: string;
    weekdayIndex: number;
    active: boolean;
  }) => ({
    cmd: "TOGGLE_WEEKDAY" as const,
    ...params,
  }),
  CHANGE_WEEKDAY_DINNER: (params: {
    weekdayIndex: number;
    dinnerId: string | null;
  }) => ({
    cmd: "CHANGE_WEEKDAY_DINNER" as const,
    ...params,
  }),
};

type Command = ReturnTypes<typeof commands, ICommand>;

const states = {
  PLANNING: (
    { userId }: { userId: string },
    command?: PickCommand<Command, "TOGGLE_WEEKDAY" | "CHANGE_WEEKDAY_DINNER">
  ) => ({
    state: "PLANNING" as const,
    userId,
    [$COMMAND]: command,
    ...actions,
  }),
};

type State = ReturnTypes<typeof states, IState>;

export const { PLANNING } = states;

const transitions: TTransitions<State, Action> = {
  PLANNING: {
    CHANGE_WEEKDAY_DINNER: (state, { dinnerId, weekdayIndex }) =>
      PLANNING(
        state,
        commands.CHANGE_WEEKDAY_DINNER({
          dinnerId,
          weekdayIndex,
        })
      ),
    TOGGLE_WEEKDAY: (state, { userId, todoId, weekdayIndex, active }) =>
      userId === state.userId
        ? PLANNING(
            { userId: state.userId },
            commands.TOGGLE_WEEKDAY({
              todoId,
              weekdayIndex,
              active,
            })
          )
        : state,
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

  useCommandEffect(
    state,
    "TOGGLE_WEEKDAY",
    ({ todoId, weekdayIndex, active }) => {
      storage.setWeekTaskActivity({
        weekId,
        todoId,
        userId: user.id,
        active,
        weekdayIndex,
      });
    }
  );

  useCommandEffect(
    state,
    "CHANGE_WEEKDAY_DINNER",
    ({ weekdayIndex, dinnerId }) => {
      storage.setWeekDinner({
        weekId,
        dinnerId,
        weekdayIndex,
      });
    }
  );

  return planNextWeekReducer;
};
