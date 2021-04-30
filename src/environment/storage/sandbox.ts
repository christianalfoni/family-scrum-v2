import { result } from "react-states";
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
      shopCount: 0,
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

  const weeks: {
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

  return (familyId) => ({
    getGroceries: () =>
      result(async (ok) => {
        await randomWait();
        return ok(groceries);
      }),
    getWeek: (id) =>
      result(async (ok) => {
        await randomWait();
        return ok(weeks[id]);
      }),
    getTasks: () =>
      result(async (ok) => {
        await randomWait();
        return ok(tasks);
      }),
    addGrocery: (category, name) =>
      result(async (ok) => {
        await randomWait();
        const newGrocery: GroceryDTO = {
          id: `grocery_${groceries.length}`,
          created: Date.now(),
          category,
          name,
          shopCount: 0,
        };
        groceries.push(newGrocery);

        return ok(newGrocery);
      }),
    deleteGrocery: (id) =>
      result(async (ok) => {
        await randomWait();
        groceries = groceries.filter((grocery) => grocery.id !== id);

        return ok();
      }),
    getFamily: (id) =>
      result(async (ok) => {
        await randomWait();
        return ok(family);
      }),
    getFamilyData: (weekId) =>
      result(async (ok) => {
        await randomWait();
        return ok({
          groceries,
          tasks,
          week: weeks[weekId],
        });
      }),
    archiveTask: (id) =>
      result(async (ok) => {
        await randomWait();
        return ok();
      }),
    setGroceryShopCount: (id, shopCount) =>
      result(async (ok) => {
        await randomWait();
        const existingGrocery = groceries.find((grocery) => grocery.id === id)!;

        return ok({
          ...existingGrocery,
          shopCount,
        });
      }),
    setWeekTaskActivity: (weekId, taskId, userId, weekTaskActivity) =>
      result(async (ok) => {
        await randomWait();
        weeks[weekId].tasks[taskId][userId] = weekTaskActivity;

        return ok(weekTaskActivity);
      }),
    subscribeToGroceries: () => () => {},
    subscribeToTasks: () => () => {},
    subscribeToWeekTaskActivity: () => () => {},
  });
};
