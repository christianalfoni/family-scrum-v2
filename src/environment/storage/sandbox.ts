import { events as reactStatesEvents } from "react-states";
import {
  GroceryDTO,
  GroceryCategoryDTO,
  Storage,
  WeekDTO,
  TodoDTO,
  FamilyDTO,
  CalendarEventDTO,
  WeekTodoActivity,
} from ".";
import {
  getCurrentWeekId,
  getNextWeekId,
  getPreviousWeekId,
} from "../../utils";
import { randomWait } from "../utils";

export const createStorage = (): Storage => {
  const family: FamilyDTO = {
    id: "456",
    users: {
      user_1: {
        name: "Bob Saget",
        avatar:
          "https://cdn.iconscout.com/icon/free/png-256/avatar-366-456318.png",
      },
      user_2: {
        name: "Kate Winslet",
        avatar:
          "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/11_avatar-512.png",
      },
    },
  };

  let groceries: GroceryDTO[] = [
    {
      id: "grocery_0",
      created: Date.now(),
      category: GroceryCategoryDTO.DryGoods,
      name: "Gryn",
      shopCount: 1,
    },
  ];

  let events: {
    [eventId: string]: CalendarEventDTO;
  } = {
    event_0: {
      id: "event_0",
      created: Date.now(),
      description: "Go on a trip",
      date: 1624128658456,
      userIds: ["user_1", "user_2"],
    },
  };

  let todos: {
    [todoId: string]: TodoDTO;
  } = {
    todo_0: {
      id: "todo_0",
      created: Date.now(),
      description: "Do something cool",
    },
    todo_1: {
      id: "todo_1",
      created: Date.now(),
      description: "Do something else",
    },
  };

  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();

  let weeks: {
    [id: string]: WeekDTO;
  } = {
    [previousWeekId]: {
      id: previousWeekId,
      todos: {
        todo_0: {
          user_1: [true, false, false, false, false, false, false],
          user_2: [false, false, false, true, false, false, false],
        },
        todo_1: {
          user_1: [false, false, false, false, true, false, false],
          user_2: [false, true, true, false, false, false, false],
        },
      },
    },
    [currentWeekId]: {
      id: currentWeekId,
      todos: {
        todo_0: {
          user_2: [false, false, false, false, true, false, false],
        },
        todo_1: {
          user_1: [false, false, false, false, false, true, false],
          user_2: [false, true, false, false, false, true, false],
        },
      },
    },
    [nextWeekId]: {
      id: nextWeekId,
      todos: {
        todo_0: {
          user_1: [false, false, false, false, false, false, false],
          user_2: [false, false, false, false, false, false, false],
        },
        todo_1: {
          user_1: [false, false, false, false, false, false, false],
          user_2: [false, false, false, false, false, false, false],
        },
      },
    },
  };

  return {
    events: reactStatesEvents(),
    async fetchWeeks() {
      this.events.emit({
        type: "STORAGE:WEEKS_UPDATE",
        currentWeek: weeks[currentWeekId],
        nextWeek: weeks[nextWeekId],
        previousWeek: weeks[previousWeekId],
      });
    },
    async addGrocery(_, category, name) {
      await randomWait();
      const newGrocery: GroceryDTO = {
        id: `grocery_${groceries.length}`,
        created: Date.now(),
        category,
        name,
        shopCount: 0,
      };
      groceries = groceries.concat(newGrocery);

      this.events.emit({
        type: "STORAGE:ADD_GROCERY_SUCCESS",
        grocery: newGrocery,
      });
    },
    async addEvent(_, userId, description, date) {
      await randomWait();
      const id = `event_${Object.keys(events).length}`;
      const event: CalendarEventDTO = {
        id,
        created: Date.now(),
        date,
        description,
        userIds: [userId],
      };
      events = {
        ...events,
        [id]: event,
      };

      this.events.emit({
        type: "STORAGE:EVENTS_UPDATE",
        events,
      });
    },
    async addTodo(_, description) {
      await randomWait();
      const id = `todo_${Object.keys(todos).length}`;
      const todo: TodoDTO = {
        id,
        description,
        created: Date.now(),
      };

      todos = {
        ...todos,
        [id]: todo,
      };

      this.events.emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });
    },
    async deleteGrocery(_, id) {
      await randomWait();
      groceries = groceries.filter((grocery) => grocery.id !== id);

      this.events.emit({
        type: "STORAGE:DELETE_GROCERY_SUCCESS",
        id,
      });
    },
    async fetchFamilyData() {
      await randomWait();
      this.events.emit({
        type: "STORAGE:FETCH_FAMILY_DATA_SUCCESS",
        groceries,
        todos,
        family,
        events,
      });
    },
    async archiveTodo(_, id) {
      await randomWait();
      todos = {
        ...todos,
      };

      delete todos[id];

      for (let week in weeks) {
        delete weeks[week].todos[id];
      }

      this.events.emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });
    },
    async increaseGroceryShopCount(_, id) {
      await randomWait();

      groceries = groceries.map((grocery) =>
        grocery.id === id
          ? {
              ...grocery,
              shopCount: grocery.shopCount + 1,
            }
          : grocery
      );

      const grocery = groceries.find((grocery) => grocery.id === id)!;

      this.events.emit({
        type: "STORAGE:SET_GROCERY_SHOP_COUNT_SUCCESS",
        grocery,
      });
    },
    async resetGroceryShopCount(_, id) {
      await randomWait();

      groceries = groceries.map((grocery) =>
        grocery.id === id
          ? {
              ...grocery,
              shopCount: 0,
            }
          : grocery
      );

      const grocery = groceries.find((grocery) => grocery.id === id)!;

      this.events.emit({
        type: "STORAGE:SET_GROCERY_SHOP_COUNT_SUCCESS",
        grocery,
      });
    },
    async setWeekTaskActivity({
      familyId,
      weekId,
      userId,
      todoId,
      weekdayIndex,
      active,
    }) {
      await randomWait();

      const weekTodoActivity: WeekTodoActivity = weeks[weekId].todos[todoId]?.[
        userId
      ] ?? [false, false, false, false, false, false, false];

      weeks = {
        ...weeks,
        [weekId]: {
          ...weeks[weekId],
          todos: {
            ...weeks[weekId].todos,
            [todoId]: {
              ...weeks[weekId].todos[todoId],
              [userId]: [
                ...weekTodoActivity.slice(0, weekdayIndex),
                active,
                ...weekTodoActivity.slice(weekdayIndex + 1),
              ] as WeekTodoActivity,
            },
          },
        },
      };

      this.events.emit({
        type:
          weekId === currentWeekId
            ? "STORAGE:CURRENT_WEEK_TODO_ACTIVITY_UPDATE"
            : "STORAGE:NEXT_WEEK_TODO_ACTIVITY_UPDATE",
        weekId,
        todoId,
        userId,
        activity: weeks[weekId].todos[todoId][userId],
      });
    },
  };
};
