import { useReducer } from "react";
import {
  createActions,
  createStates,
  ActionsUnion,
  StatesUnion,
  transition,
  useDevtools,
  useTransition,
} from "react-states";

import { FamilyUserDTO } from "../../environment-interface/authentication";
import {
  useSetWeekDinner,
  useSetWeekTaskActivity,
  Weeks,
} from "../../hooks/useWeeks";

const actions = createActions({
  TOGGLE_WEEKDAY: (params: {
    todoId: string;
    userId: string;
    weekdayIndex: number;
    active: boolean;
  }) => ({
    ...params,
  }),
  CHANGE_WEEKDAY_DINNER: (params: {
    weekdayIndex: number;
    dinnerId: string | null;
  }) => ({
    ...params,
  }),
});

type Action = ActionsUnion<typeof actions>;

const states = createStates({
  PLANNING: ({ userId }: { userId: string }) => ({
    userId,
    ...actions,
  }),
});

type State = StatesUnion<typeof states>;

export const { PLANNING } = states;

const reducer = (prevState: State, action: Action) =>
  transition(prevState, action, {
    PLANNING: {
      CHANGE_WEEKDAY_DINNER: (state, { dinnerId, weekdayIndex }) =>
        PLANNING(state),
      TOGGLE_WEEKDAY: (state, { userId }) =>
        userId === state.userId ? PLANNING(state) : state,
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
  const setWeekTaskActivity = useSetWeekTaskActivity(user);
  const setWeekDinner = useSetWeekDinner(user);
  const planNextWeekReducer = useReducer(
    reducer,
    initialState || PLANNING({ userId: user.id })
  );

  useDevtools("PlanWeek", planNextWeekReducer);

  const [state, dispatch] = planNextWeekReducer;

  useTransition(
    state,
    "PLANNING => TOGGLE_WEEKDAY => PLANNING",
    ({ userId }, { todoId, weekdayIndex, active }) => {
      setWeekTaskActivity({
        todoId,
        userId,
        active,
        weekdayIndex,
      });
    },
    [weekId]
  );

  useTransition(
    state,
    "PLANNING => CHANGE_WEEKDAY_DINNER => PLANNING",
    (_, { weekdayIndex, dinnerId }) => {
      setWeekDinner({
        dinnerId,
        weekdayIndex,
      });
    },
    [weekId]
  );

  return [state, actions(dispatch)] as const;
};
