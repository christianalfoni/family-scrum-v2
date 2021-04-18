import { Result } from "react-states";

export type StorageError = {
  type: "ERROR";
};

export type Family = {
  id: string;
  users: {
    [id: string]: {
      name: string;
      avatar: string | null;
    };
  };
};

export enum GroceryCategory {
  FruitVegetables,
  MeatDairy,
  Frozen,
  DryGoods,
  Other,
}

export type Grocery = {
  id: string;
  name: string;
  category: GroceryCategory;
  shopCount: number;
};

export type WeekTask = {
  id: string;
  description: string;
  date: number | null;
};

export type Week = {
  // Week id is the date of each Monday (YYYYMMDD)
  id: string;
  tasks: {
    // Each user has an array representing each day of the week,
    // which holds an array of ids to tasks
    [userId: string]: [
      string[],
      string[],
      string[],
      string[],
      string[],
      string[],
      string[]
    ];
  };
};

export interface Storage {
  getGroceries(): Result<Grocery[], StorageError>;
  getWeekTasks(): Result<WeekTask[], StorageError>;
  getWeek(id: string): Result<Week, StorageError>;
}
