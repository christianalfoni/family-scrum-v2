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

  let groceries: {
    [groceryId: string]: GroceryDTO;
  } = {
    grocery_0: {
      id: "grocery_0",
      created: Date.now(),
      modified: Date.now(),
      category: GroceryCategoryDTO.DryGoods,
      name: "Gryn",
      shopCount: 1,
    },
  };

  let events: {
    [eventId: string]: CalendarEventDTO;
  } = {
    event_0: {
      id: "event_0",
      created: Date.now(),
      modified: Date.now(),
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
      modified: Date.now(),
      description: "Do something cool",
    },
    todo_1: {
      id: "todo_1",
      created: Date.now(),
      modified: Date.now(),
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
    addGrocery(_, category, name) {
      const newGrocery: GroceryDTO = {
        id: `grocery_${groceries.length}`,
        created: Date.now(),
        modified: Date.now(),
        category,
        name,
        shopCount: 0,
      };

      groceries = {
        ...groceries,
        [newGrocery.id]: newGrocery,
      };

      this.events.emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });
    },
    addEvent(_, userId, description, date) {
      const id = `event_${Object.keys(events).length}`;
      const event: CalendarEventDTO = {
        id,
        created: Date.now(),
        modified: Date.now(),
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
    addTodo(_, description) {
      const id = `todo_${Object.keys(todos).length}`;
      const todo: TodoDTO = {
        id,
        description,
        created: Date.now(),
        modified: Date.now(),
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
    deleteGrocery(_, id) {
      delete groceries[id];

      groceries = {
        ...groceries,
      };

      this.events.emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
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
    archiveTodo(_, id) {
      todos = {
        ...todos,
      };

      delete todos[id];

      this.events.emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });
    },
    async archiveEvent(_, id) {
      events = {
        ...events,
      };

      delete events[id];

      this.events.emit({
        type: "STORAGE:EVENTS_UPDATE",
        events,
      });
    },
    toggleEventParticipation(_, eventId, userId) {
      events = {
        ...events,
        [eventId]: {
          ...events[eventId],
          userIds: events[eventId].userIds.includes(userId)
            ? events[eventId].userIds.filter(
                (existingUserId) => existingUserId !== userId
              )
            : events[eventId].userIds.concat(userId),
        },
      };

      this.events.emit({
        type: "STORAGE:EVENTS_UPDATE",
        events,
      });
    },
    increaseGroceryShopCount(_, id) {
      groceries = {
        ...groceries,
        [id]: {
          ...groceries[id],
          shopCount: groceries[id].shopCount + 1,
        },
      };

      this.events.emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });
    },
    resetGroceryShopCount(_, id) {
      groceries = {
        ...groceries,
        [id]: {
          ...groceries[id],
          shopCount: 0,
        },
      };

      this.events.emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });
    },
    setWeekTaskActivity({
      familyId,
      weekId,
      userId,
      todoId,
      weekdayIndex,
      active,
    }) {
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
        type: "STORAGE:WEEKS_UPDATE",
        currentWeek: weeks[currentWeekId],
        nextWeek: weeks[nextWeekId],
        previousWeek: weeks[previousWeekId],
      });
    },
  };
};
