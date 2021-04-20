import { ok, result } from "react-states";
import { Grocery, GroceryCategory, Storage, Week, Task } from ".";
import { User } from "../auth";

export const createStorage = (): Storage => {
  const users: {
    [id: string]: User;
  } = {
    user_1: {
      id: "user_1",
      name: "Bob Saget",
    },
    user_2: {
      id: "user_2",
      name: "Kate Winslet",
    },
  };

  const groceries: Grocery[] = [
    {
      id: "grocery_1",
      created: Date.now(),
      category: GroceryCategory.DryGoods,
      name: "Gryn",
      shopCount: 0,
    },
  ];

  const tasks: Task[] = [
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
    [id: string]: Week;
  } = {
    "2021319": {
      id: "2021319",
      tasks: {
        user_1: [[], [], [], [], [], [], ["task_2"]],
        user_2: [[], ["task_1"], [], [], [], [], []],
      },
    },
  };

  return {
    getGroceries: () => result(async (ok) => ok(groceries)),
    getWeek: (id) => result(async (ok) => ok(weeks[id])),
    getTasks: () => result(async (ok) => ok(tasks)),
    addGrocery: result((ok) => async (category, name) => {
      const newGrocery: Grocery = {
        id: `grocery_${groceries.length}`,
        created: Date.now(),
        category,
        name,
        shopCount: 0,
      };
      groceries.push(newGrocery);

      return ok(newGrocery);
    }),
  };
};
