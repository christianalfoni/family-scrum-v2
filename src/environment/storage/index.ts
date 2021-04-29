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

export type FamilyDTO = {
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

export type GroceryDTO = {
  id: string;
  created: number;
  name: string;
  category: GroceryCategory;
  shopCount: number;
};

export type TaskDTO = {
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

export type WeekDTO = {
  // Week id is the date of each Monday (YYYYMMDD)
  id: string;
  tasks: {
    [taskId: string]: {
      [userId: string]: WeekTaskActivity;
    };
  };
};

export interface Storage {
  (familyId: string): {
    getFamilyData(
      weekId: string
    ): Result<
      {
        groceries: GroceryDTO[];
        tasks: TaskDTO[];
        week: WeekDTO;
      },
      StorageReadError
    >;
    getGroceries(): Result<GroceryDTO[], StorageReadError>;
    getTasks(): Result<TaskDTO[], StorageReadError>;
    getWeek(id: string): Result<WeekDTO, StorageReadError>;
    addGrocery(
      category: GroceryCategory,
      name: string
    ): Result<GroceryDTO, StorageWriteError>;
    deleteGrocery(id: string): Result<void, StorageWriteError>;
    getFamily(id: string): Result<FamilyDTO, StorageReadError>;
    setGroceryShopCount(
      id: string,
      shopCount: number
    ): Result<GroceryDTO, StorageWriteError>;
    archiveTask(id: string): Result<void, StorageWriteError>;
    setWeekTaskActivity(
      weekId: string,
      taskId: string,
      userId: string,
      weekTaskActivity: WeekTaskActivity
    ): Result<WeekTaskActivity, StorageWriteError>;
    subscribeToGroceries(listener: (grocery: GroceryDTO) => void): () => void;
    subscribeToTasks(listener: (task: TaskDTO) => void): () => void;
    subscribeToWeekTaskActivity(
      listener: (
        weekId: string,
        taskId: string,
        userId: string,
        activity: WeekTaskActivity
      ) => void
    ): () => void;
  };
}
