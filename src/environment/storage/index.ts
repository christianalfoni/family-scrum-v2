import { Events } from "react-states";

export type FamilyDTO = {
  id: string;
  users: {
    [id: string]: {
      name: string;
      avatar: string | null;
    };
  };
};

export enum GroceryCategoryDTO {
  FruitVegetables = "FRUIT_VEGETABLES",
  MeatDairy = "MEAT_DAIRY",
  Frozen = "FROZEN",
  DryGoods = "DRY_GOOD",
  Other = "OTHER",
}

export type GroceryDTO = {
  id: string;
  created: number;
  name: string;
  category: GroceryCategoryDTO;
  shopCount: number;
};

export type TaskDTO = {
  id: string;
  created: number;
  description: string;
};

export type CalendarEventDTO = {
  id: string;
  created: number;
  description: string;
  date: number;
  userIds: string[];
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

export type StorageEvent =
  | {
      type: "STORAGE:FETCH_FAMILY_DATA_SUCCESS";
      family: FamilyDTO;
      groceries: GroceryDTO[];
      tasks: {
        [taskId: string]: TaskDTO;
      };
      week: WeekDTO;
      events: {
        [eventId: string]: CalendarEventDTO;
      };
    }
  | {
      type: "STORAGE:FETCH_FAMILY_DATA_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:FETCH_GROCERIES_SUCCESS";
      groceries: GroceryDTO[];
    }
  | {
      type: "STORAGE:FETCH_GROCERIES_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:FETCH_TASKS_SUCCESS";
      tasks: {
        [taskId: string]: TaskDTO;
      };
    }
  | {
      type: "STORAGE:FETCH_TASKS_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:FETCH_WEEK_SUCCESS";
      week: WeekDTO;
    }
  | {
      type: "STORAGE:FETCH_WEEK_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:ADD_GROCERY_SUCCESS";
      grocery: GroceryDTO;
    }
  | {
      type: "STORAGE:ADD_GROCERY_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:DELETE_GROCERY_SUCCESS";
      id: string;
    }
  | {
      type: "STORAGE:DELETE_GROCERY_ERROR";
      id: string;
      error: string;
    }
  | {
      type: "STORAGE:FETCH_FAMILY_SUCCESS";
      family: FamilyDTO;
    }
  | {
      type: "STORAGE:FETCH_FAMILY_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:SET_GROCERY_SHOP_COUNT_SUCCESS";
      grocery: GroceryDTO;
    }
  | {
      type: "STORAGE:SET_GROCERY_SHOP_COUNT_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:ARCHIVE_TASK_SUCCESS";
      id: string;
    }
  | {
      type: "STORAGE:ARCHIVE_TASK_ERROR";
      id: string;
      error: string;
    }
  | {
      type: "STORAGE:SET_WEEK_TASK_ACTIVITY_SUCCESS";
      weekId: string;
      taskId: string;
      userId: string;
    }
  | {
      type: "STORAGE:SET_WEEK_TASK_ACTIVITY_ERROR";
      weekId: string;
      taskId: string;
      userId: string;
      error: string;
    };

export interface Storage {
  events: Events<StorageEvent>;
  /**
   *
   * @param familyId
   * @param weekId
   * @fires STORAGE:FETCH_FAMILY_DATA_SUCCESS
   * @fires STORAGE:FETCH_FAMILY_DATA_ERROR
   */
  fetchFamilyData(familyId: string, weekId: string): void;
  fetchGroceries(familyId: string): void;
  fetchTasks(familyId: string): void;
  fetchWeek(familyId: string, id: string): void;
  addGrocery(
    familyId: string,
    category: GroceryCategoryDTO,
    name: string
  ): void;
  deleteGrocery(familyId: string, id: string): void;
  fetchFamily(familyId: string, id: string): void;
  increaseGroceryShopCount(familyId: string, id: string): void;
  resetGroceryShopCount(familyId: string, id: string): void;
  archiveTask(familyId: string, id: string): void;
  setWeekTaskActivity(
    familyId: string,
    weekId: string,
    taskId: string,
    userId: string,
    weekTaskActivity: WeekTaskActivity
  ): void;
}
