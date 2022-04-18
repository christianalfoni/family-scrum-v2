import { StatesReducer, useCommandEffect } from "react-states";

import {
  createReducer,
  useEnvironment,
  useReducer,
} from "../../environment-interface";
import { FamilyUserDTO } from "../../environment-interface/authentication";

type State = {
  state: "PLANNING";
  userId: string;
};

type Action =
  | {
      type: "TOGGLE_WEEKDAY";
      todoId: string;
      userId: string;
      weekdayIndex: number;
      active: boolean;
    }
  | {
      type: "CHANGE_WEEKDAY_DINNER";
      weekdayIndex: number;
      dinnerId: string | null;
    };

type Command =
  | {
      cmd: "TOGGLE_WEEKDAY";
      todoId: string;
      weekdayIndex: number;
      active: boolean;
    }
  | {
      cmd: "CHANGE_WEEKDAY_DINNER";
      weekdayIndex: number;
      dinnerId: string | null;
    };

export type PlanNextWeekReducer = StatesReducer<State, Action, Command>;

const reducer = createReducer<PlanNextWeekReducer>({
  PLANNING: {
    CHANGE_WEEKDAY_DINNER: ({
      state,
      action: { dinnerId, weekdayIndex },
      transition,
    }) =>
      transition(state, {
        cmd: "CHANGE_WEEKDAY_DINNER",
        dinnerId,
        weekdayIndex,
      }),
    TOGGLE_WEEKDAY: ({
      state,
      action: { userId, todoId, weekdayIndex, active },
      transition,
      noop,
    }) =>
      userId === state.userId
        ? transition(state, {
            cmd: "TOGGLE_WEEKDAY",
            todoId,
            weekdayIndex,
            active,
          })
        : noop(),
  },
});

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
    "PlanWeek",
    reducer,
    initialState || {
      state: "PLANNING",
      userId: user.id,
    }
  );

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
