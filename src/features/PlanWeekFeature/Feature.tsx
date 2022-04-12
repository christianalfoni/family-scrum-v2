import { differenceInDays } from "date-fns";
import { createContext, useContext } from "react";
import {
  StatesReducer,
  StatesTransition,
  useCommandEffect,
} from "react-states";

import {
  createReducer,
  useEnvironment,
  useReducer,
} from "../../environment-interface";

import { getDateFromWeekId, isWithinWeek } from "../../utils";
import { Todo, Todos, User, Week } from "../DashboardFeature";

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

export type PlanWeekFeature = StatesReducer<State, Action, Command>;

type Transition = StatesTransition<PlanWeekFeature>;

const featureContext = createContext({} as PlanWeekFeature);

const reducer = createReducer<PlanWeekFeature>({
  PLANNING: {
    TOGGLE_WEEKDAY: (
      state,
      { userId, todoId, weekdayIndex, active }
    ): Transition =>
      userId === state.userId
        ? [
            state,
            {
              cmd: "TOGGLE_WEEKDAY",
              todoId,
              weekdayIndex,
              active,
            },
          ]
        : state,
    CHANGE_WEEKDAY_DINNER: (state, { dinnerId, weekdayIndex }): Transition => [
      state,
      {
        cmd: "CHANGE_WEEKDAY_DINNER",
        dinnerId,
        weekdayIndex,
      },
    ],
  },
});

export const useFeature = () => useContext(featureContext);

export const selectors = {
  todosByType(
    todos: Todos,
    previousWeek: Week,
    currentWeekId: string
  ): {
    previousWeek: Todo[];
    eventsThisWeek: Todo[];
    thisWeek: Todo[];
    laterEvents: Todo[];
  } {
    const todosInPreviousWeek = Object.keys(previousWeek.todos).filter(
      (todoId) => {
        for (let userId in previousWeek.todos[todoId]) {
          if (previousWeek.todos[todoId][userId].includes(true)) {
            return true;
          }
        }

        return false;
      }
    );
    const currentWeekDate = getDateFromWeekId(currentWeekId);
    const result = Object.values(todos).reduce(
      (aggr, todo) => {
        if (todosInPreviousWeek.includes(todo.id)) {
          aggr.previousWeek.push(todo);

          return aggr;
        }
        if (todo.date && isWithinWeek(todo.date, currentWeekDate)) {
          aggr.eventsThisWeek.push(todo);
          return aggr;
        }

        if (todo.date && differenceInDays(todo.date, currentWeekDate) > 7) {
          aggr.laterEvents.push(todo);
          return aggr;
        }

        if (!todo.date) {
          aggr.thisWeek.push(todo);
          return aggr;
        }

        return aggr;
      },
      {
        previousWeek: [] as Todo[],
        eventsThisWeek: [] as Todo[],
        laterEvents: [] as Todo[],
        thisWeek: [] as Todo[],
      }
    );

    result.eventsThisWeek.sort((a, b) => {
      if (a.date! > b.date!) {
        return 1;
      }

      if (a.date! < b.date!) {
        return -1;
      }

      return 0;
    });

    result.laterEvents.sort((a, b) => {
      if (a.date! > b.date!) {
        return 1;
      }

      if (a.date! < b.date!) {
        return -1;
      }

      return 0;
    });

    return result;
  },
};

export const Feature = ({
  user,
  weekId,
  children,
  initialState = {
    state: "PLANNING",
    userId: user.id,
  },
}: {
  user: User;
  weekId: string;
  children: React.ReactNode;
  initialState?: State;
}) => {
  const { storage } = useEnvironment();
  const feature = useReducer("PlanWeek", reducer, initialState);

  const [state] = feature;

  useCommandEffect(
    state,
    "TOGGLE_WEEKDAY",
    ({ todoId, weekdayIndex, active }) => {
      storage.setWeekTaskActivity({
        familyId: user.familyId,
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
        familyId: user.familyId,
        weekId,
        dinnerId,
        weekdayIndex,
      });
    }
  );

  return (
    <featureContext.Provider value={feature}>
      {children}
    </featureContext.Provider>
  );
};
