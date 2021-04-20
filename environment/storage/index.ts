import { Result } from "react-states";

export type StorageError =
  | {
      type: "ERROR";
    }
  | {
      type: "NO_ACCESS";
    };

export type StorageReadError =
  | StorageError
  | {
      type: "NOT_FOUND";
    };

export type StorageWriteError =
  | StorageError
  | {
      type: "WRITE_ERROR";
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
  created: number;
  name: string;
  category: GroceryCategory;
  shopCount: number;
};

export type Task = {
  id: string;
  created: number;
  description: string;
  date: number | null;
};

// Each user has an array representing each day of the week,
// which holds a boolean if the task is active or not
export type WeekTaskActivity = [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
];

export type Week = {
  // Week id is the date of each Monday (YYYYMMDD)
  id: string;
  tasks: {
    [taskId: string]: {
      [userId: string]: WeekTaskActivity;
    };
  };
};

export interface Storage {
  getGroceries(): Result<Grocery[], StorageReadError>;
  getTasks(): Result<Task[], StorageReadError>;
  getWeek(id: string): Result<Week, StorageReadError>;
  addGrocery(
    category: GroceryCategory,
    name: string
  ): Result<Grocery, StorageWriteError>;
  deleteGrocery(id: string): Result<void, StorageWriteError>;
  getFamily(id: string): Result<Family, StorageReadError>;
  setGroceryShopCount(
    id: string,
    shopCount: number
  ): Result<Grocery, StorageWriteError>;
  archiveTask(id: string): Result<void, StorageWriteError>;
  setWeekTaskActivity(
    id: string,
    weekTaskActivity: WeekTaskActivity
  ): Result<WeekTaskActivity, StorageWriteError>;
}
