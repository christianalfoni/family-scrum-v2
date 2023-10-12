import levenshtein from "fast-levenshtein";
import { differenceInDays, getDay, isThisWeek } from "date-fns";

import { getDateFromWeekId, isWithinWeek, mod } from "./utils";
import {
  CheckListItemDTO,
  DinnerDTO,
  GroceryDTO,
  TodoDTO,
  WeekDTO,
} from "./types";

export type WeekdayTodos = {
  [todoId: string]: string[];
};

export const todosByWeekday = (week: WeekDTO) => {
  const todosByWeekday: [
    WeekdayTodos,
    WeekdayTodos,
    WeekdayTodos,
    WeekdayTodos,
    WeekdayTodos,
    WeekdayTodos,
    WeekdayTodos,
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
};

export const checkLists = (todos: Record<string, TodoDTO>) =>
  Object.values(todos).filter((todo) => Boolean(todo.checkList));

export const eventsByWeekday = (todos: Record<string, TodoDTO>) => {
  const eventsByWeekday: [
    TodoDTO[],
    TodoDTO[],
    TodoDTO[],
    TodoDTO[],
    TodoDTO[],
    TodoDTO[],
    TodoDTO[],
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
    }),
  );
};

export const sortedTodos = (todos: Record<string, TodoDTO>) =>
  Object.values(todos).sort((a, b) => {
    if (a.created < b.created) {
      return 1;
    } else if (a.created > b.created) {
      return -1;
    }

    return 0;
  });

export const sortedDinners = (dinners: Record<string, DinnerDTO>) =>
  Object.values(dinners).sort((a, b) => {
    if (a.created < b.created) {
      return 1;
    } else if (a.created > b.created) {
      return -1;
    }

    return 0;
  });

export const shopCount = (groceries: Record<string, GroceryDTO>) => {
  return Object.values(groceries).length;
};

export const sortedGroceriesByNameAndCreated = (
  groceries: GroceryDTO[],
  since: number,
) =>
  groceries.slice().sort((a, b) => {
    if (a.created > since || a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }

    return 0;
  });

export const filteredGroceriesByInput = (
  groceries: GroceryDTO[],
  input: string,
) => {
  if (input) {
    const lowerCaseInput = input.toLocaleLowerCase();

    return groceries
      .filter((grocery) => {
        const lowerCaseGroceryName = grocery.name.toLowerCase();

        return (
          lowerCaseGroceryName.includes(lowerCaseInput) ||
          levenshtein.get(grocery.name.toLowerCase(), input.toLowerCase()) < 3
        );
      })
      .sort((a, b) => {
        if (a.name.startsWith(input) && !b.name.startsWith(input)) {
          return -1;
        }
        if (!a.name.startsWith(input) && b.name.startsWith(input)) {
          return 1;
        }

        return 0;
      });
  }

  return groceries;
};

export const todosByType = (
  todos: Record<string, TodoDTO>,
  previousWeek: WeekDTO,
  currentWeekId: string,
): {
  previousWeek: TodoDTO[];
  eventsThisWeek: TodoDTO[];
  thisWeek: TodoDTO[];
  laterEvents: TodoDTO[];
} => {
  const todosInPreviousWeek = Object.keys(previousWeek.todos).filter(
    (todoId) => {
      for (let userId in previousWeek.todos[todoId]) {
        if (previousWeek.todos[todoId][userId].includes(true)) {
          return true;
        }
      }

      return false;
    },
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
      previousWeek: [] as TodoDTO[],
      eventsThisWeek: [] as TodoDTO[],
      laterEvents: [] as TodoDTO[],
      thisWeek: [] as TodoDTO[],
    },
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
};

export const sortedCheckListItems = (checkListItems: {
  [itemId: string]: CheckListItemDTO;
}) => {
  return Object.values(checkListItems).sort((a, b) => {
    if (a.created > b.created) {
      return 1;
    }
    if (a.created < b.created) {
      return -1;
    }

    return 0;
  });
};
