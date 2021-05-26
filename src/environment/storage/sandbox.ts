import { events as reactStatesEvents } from "react-states";
import {
  GroceryDTO,
  GroceryCategoryDTO,
  Storage,
  WeekDTO,
  TaskDTO,
  FamilyDTO,
  CalendarEventDTO,
  WeekTaskActivity,
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

  const events: {
    [eventId: string]: CalendarEventDTO;
  } = {
    event_1: {
      id: "event_1",
      created: Date.now(),
      description: "Go on a trip",
      date: 1624128658456,
      userIds: ["user_1", "user_2"],
    },
  };

  const tasks: {
    [taskId: string]: TaskDTO;
  } = {
    task_1: {
      id: "task_1",
      created: Date.now(),
      description: "Do something cool",
    },
    task_2: {
      id: "task_2",
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
      tasks: {
        task_1: {
          user_1: [true, false, false, false, false, false, false],
          user_2: [false, false, false, true, false, false, false],
        },
        task_2: {
          user_1: [false, false, false, false, true, false, false],
          user_2: [false, true, true, false, false, false, false],
        },
      },
    },
    [currentWeekId]: {
      id: currentWeekId,
      tasks: {
        task_1: {
          user_1: [false, false, false, false, true, false, false],
          user_2: [false, true, false, false, false, false, false],
        },
        task_2: {
          user_1: [false, false, false, false, false, true, false],
          user_2: [false, true, false, false, false, true, false],
        },
      },
    },
    [nextWeekId]: {
      id: nextWeekId,
      tasks: {
        task_1: {
          user_1: [false, false, false, false, false, false, false],
          user_2: [false, false, false, false, false, false, false],
        },
        task_2: {
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
    async deleteGrocery(_, id) {
      await randomWait();
      groceries = groceries.filter((grocery) => grocery.id !== id);

      this.events.emit({
        type: "STORAGE:DELETE_GROCERY_SUCCESS",
        id,
      });
    },
    async fetchFamily(_, id) {
      await randomWait();
      this.events.emit({
        type: "STORAGE:FETCH_FAMILY_SUCCESS",
        family,
      });
    },
    async fetchFamilyData() {
      await randomWait();
      this.events.emit({
        type: "STORAGE:FETCH_FAMILY_DATA_SUCCESS",
        groceries,
        tasks,
        family,
        events,
      });
    },
    async archiveTask(_, id) {
      await randomWait();
      this.events.emit({
        type: "STORAGE:ARCHIVE_TASK_SUCCESS",
        id,
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
      taskId,
      weekdayIndex,
      active,
    }) {
      await randomWait();

      weeks = {
        ...weeks,
        [weekId]: {
          ...weeks[weekId],
          tasks: {
            ...weeks[weekId].tasks,
            [taskId]: {
              ...weeks[weekId].tasks[taskId],
              [userId]: [
                ...weeks[weekId].tasks[taskId][userId].slice(0, weekdayIndex),
                active,
                ...weeks[weekId].tasks[taskId][userId].slice(weekdayIndex + 1),
              ] as WeekTaskActivity,
            },
          },
        },
      };

      this.events.emit({
        type:
          weekId === currentWeekId
            ? "STORAGE:CURRENT_WEEK_TASK_ACTIVITY_UPDATE"
            : "STORAGE:NEXT_WEEK_TASK_ACTIVITY_UPDATE",
        weekId,
        taskId,
        userId,
        activity: weeks[weekId].tasks[taskId][userId],
      });
    },
  };
};
