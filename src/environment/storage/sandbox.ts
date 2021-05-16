import { events } from "react-states";
import {
  GroceryDTO,
  GroceryCategory,
  Storage,
  WeekDTO,
  TaskDTO,
  FamilyDTO,
} from ".";
import { randomWait } from "../utils";

export const createStorage = (): Storage => {
  const family: FamilyDTO = {
    id: "456",
    users: {
      user_1: {
        name: "Bob Saget",
        avatar:
          "https://cdn.icon-icons.com/icons2/2643/PNG/512/male_boy_person_people_avatar_icon_159358.png",
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
      id: "grocery_1",
      created: Date.now(),
      category: GroceryCategory.DryGoods,
      name: "Gryn",
      shopCount: 1,
    },
  ];

  const tasks: TaskDTO[] = [
    {
      id: "task_1",
      created: Date.now(),
      description: "Do something cool",
      date: null,
    },
    {
      id: "task_2",
      created: Date.now(),
      description: "Do something else",
      date: null,
    },
    {
      id: "task_3",
      created: Date.now(),
      description: "Go on a trip",
      date: 1624128658456,
    },
  ];

  let weeks: {
    [id: string]: WeekDTO;
  } = {
    "2021319": {
      id: "2021319",
      tasks: {
        task_1: {
          user_1: [false, false, false, false, true, false, false],
          user_2: [false, true, false, false, false, false, false],
        },
      },
    },
  };

  return {
    events: events(),
    async fetchGroceries() {
      await randomWait();
      this.events.emit({
        type: "STORAGE:FETCH_GROCERIES_SUCCESS",
        groceries,
      });
    },
    async fetchWeek(_, id) {
      await randomWait();
      this.events.emit({
        type: "STORAGE:FETCH_WEEK_SUCCESS",
        week: weeks[id],
      });
    },
    async fetchTasks() {
      await randomWait();
      this.events.emit({
        type: "STORAGE:FETCH_TASKS_SUCCESS",
        tasks,
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
      groceries.push(newGrocery);

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
    async fetchFamilyData(_, weekId) {
      await randomWait();
      this.events.emit({
        type: "STORAGE:FETCH_FAMILY_DATA_SUCCESS",
        groceries,
        tasks,
        week: weeks[weekId],
      });
    },
    async archiveTask(_, id) {
      await randomWait();
      this.events.emit({
        type: "STORAGE:ARCHIVE_TASK_SUCCESS",
        id,
      });
    },
    async setGroceryShopCount(_, id, shopCount) {
      await randomWait();

      groceries = groceries.map((grocery) =>
        grocery.id === id
          ? {
              ...grocery,
              shopCount,
            }
          : grocery
      );

      const grocery = groceries.find((grocery) => grocery.id === id)!;

      this.events.emit({
        type: "STORAGE:SET_GROCERY_SHOP_COUNT_SUCCESS",
        grocery,
      });
    },
    async setWeekTaskActivity(_, weekId, taskId, userId, weekTaskActivity) {
      await randomWait();

      weeks = {
        ...weeks,
        [weekId]: {
          ...weeks[weekId],
          tasks: {
            ...weeks[weekId].tasks,
            [taskId]: {
              ...weeks[weekId].tasks[taskId],
              [userId]: weekTaskActivity,
            },
          },
        },
      };

      this.events.emit({
        type: "STORAGE:SET_WEEK_TASK_ACTIVITY_SUCCESS",
        weekId,
        taskId,
        userId,
      });
    },
  };
};
