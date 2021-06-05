import { Events } from "react-states";

export type FamilyDTO = {
  id: string;
  users: {
    [id: string]: {
      name: string;
      avatar: string;
    };
  };
};

export enum GroceryCategoryDTO {
  FruitVegetables,
  MeatDairy,
  Frozen,
  DryGoods,
  Other,
}

export type BarcodeDTO = {
  id: string
  created: number;
  modified: number;
  groceryId: string | null
}

export type GroceryDTO = {
  id: string;
  created: number;
  modified: number;
  name: string;
  category: GroceryCategoryDTO;
  shopCount: number;
};

export type TodoDTO = {
  id: string;
  created: number;
  modified: number;
  description: string;
};

export type CalendarEventDTO = {
  id: string;
  created: number;
  modified: number;
  description: string;
  date: number;
  userIds: string[];
};

// Each user has an array representing each day of the week,
// which holds a boolean if the todo is active or not
export type WeekTodoActivity = [
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
  todos: {
    [todoId: string]: {
      [userId: string]: WeekTodoActivity;
    };
  };
};

export type StorageEvent =
  | {
    type: "STORAGE:FETCH_FAMILY_DATA_SUCCESS";
    family: FamilyDTO;
    groceries: {
      [groceryId: string]: GroceryDTO;
    };
    todos: {
      [todoId: string]: TodoDTO;
    };
    events: {
      [eventId: string]: CalendarEventDTO;
    };
    barcodes: {
      [barcodeId: string]: BarcodeDTO
    };
  }
  | {
    type: "STORAGE:FETCH_FAMILY_DATA_ERROR";
    error: string;
  }
  | {
    type: "STORAGE:WEEKS_UPDATE";
    previousWeek: WeekDTO;
    currentWeek: WeekDTO;
    nextWeek: WeekDTO;
  }
  | {
    type: "STORAGE:BARCODES_UPDATE";
    barcodes: {
      [barcodeId: string]: BarcodeDTO
    };
  }
  | {
    type: "STORAGE:LINK_BARCODE_ERROR";
    error: string;
  }
  | {
    type: "STORAGE:UNLINK_BARCODE_ERROR";
    error: string;
  }
  | {
    type: "STORAGE:FETCH_WEEKS_ERROR";
    error: string;
  }
  | {
    type: "STORAGE:EVENTS_UPDATE";
    events: {
      [eventId: string]: CalendarEventDTO;
    };
  }
  | {
    type: "STORAGE:ADD_EVENT_ERROR";
    error: string;
    description: string;
    date: number;
    userId: string;
  }
  | {
    type: "STORAGE:TODOS_UPDATE";
    todos: {
      [todoId: string]: TodoDTO;
    };
  }
  | {
    type: "STORAGE:ADD_TODO_ERROR";
    error: string;
    description: string;
  }
  | {
    type: "STORAGE:GROCERIES_UPDATE";
    groceries: {
      [groceryId: string]: GroceryDTO;
    };
  }
  | {
    type: "STORAGE:ADD_GROCERY_ERROR";
    error: string;
    name: string;
    category: GroceryCategoryDTO;
  }
  | {
    type: "STORAGE:DELETE_GROCERY_ERROR";
    id: string;
    error: string;
  }
  | {
    type: "STORAGE:INCREASE_GROCERY_SHOP_COUNT_ERROR";
    id: string;
    error: string;
  }
  | {
    type: "STORAGE:RESET_GROCERY_SHOP_COUNT_ERROR";
    id: string;
    error: string;
  }
  | {
    type: "STORAGE:ARCHIVE_TODO_ERROR";
    id: string;
    error: string;
  }
  | {
    type: "STORAGE:ARCHIVE_EVENT_ERROR";
    id: string;
    error: string;
  }
  | {
    type: "STORAGE:TOGGLE_EVENT_PARTICIPATION_ERROR";
    eventId: string;
    userId: string;
    error: string;
  }
  | {
    type: "STORAGE:SET_WEEK_TODO_ACTIVITY_ERROR";
    weekId: string;
    todoId: string;
    userId: string;
    error: string;
  };

export interface Storage {
  events: Events<StorageEvent>;
  /**
   *
   * @fires STORAGE:GROCERIES_UPDATE
   * @fires STORAGE:TODOS_UPDATE
   * @fires STORAGE:EVENTS_UPDATE
   * @fires STORAGE:BARCODES_UPDATE
   * @fires STORAGE:FETCH_FAMILY_DATA_SUCCESS
   * @fires STORAGE:FETCH_FAMILY_DATA_ERROR
   */
  fetchFamilyData(familyId: string): void;
  /**
   *
   * @fires STORAGE:WEEKS_UPDATE
   * @fires STORAGE:FETCH_WEEKS_ERROR
   */
  fetchWeeks(familyId: string, userId: string): void;
  /**
   *
   * @fires STORAGE:GROCERIES_UPDATE
   * @fires STORAGE:ADD_GROCERY_ERROR
   */
  addGrocery(
    familyId: string,
    category: GroceryCategoryDTO,
    name: string
  ): void;
  /**
   *
   * @fires STORAGE:TODOS_UPDATE
   * @fires STORAGE:ADD_TODO_ERROR
   */
  addTodo(familyId: string, description: string): void;
  /**
   *
   * @fires STORAGE:EVENTS_UPDATE
   * @fires STORAGE:ADD_EVENT_ERROR
   */
  addEvent(
    familyId: string,
    userId: string,
    description: string,
    date: number
  ): void;
  /**
   *
   * @fires STORAGE:GROCERIES_UPDATE
   * @fires STORAGE:DELETE_GROCERY_ERROR
   */
  deleteGrocery(familyId: string, id: string): void;
  /**
   *
   * @fires STORAGE:GROCERIES_UPDATE
   * @fires STORAGE:INCREASE_GROCERY_SHOP_COUNT_ERROR
   */
  increaseGroceryShopCount(familyId: string, id: string): void;
  /**
   *
   * @fires STORAGE:GROCERIES_UPDATE
   * @fires STORAGE:RESET_GROCERY_SHOP_COUNT_ERROR
   */
  resetGroceryShopCount(familyId: string, id: string): void;
  /**
   *
   * @fires STORAGE:TODOS_UPDATE
   * @fires STORAGE:ARCHIVE_TODO_ERROR
   */
  archiveTodo(familyId: string, id: string): void;
  /**
   *
   * @fires STORAGE:EVENTS_UPDATE
   * @fires STORAGE:ARCHIVE_EVENT_ERROR
   */
  archiveEvent(familyId: string, id: string): void;
  /**
   *
   * @fires STORAGE:EVENTS_UPDATE
   * @fires STORAGE:TOGGLE_EVENT_PARTICIPATION_ERROR
   */
  toggleEventParticipation(
    familyId: string,
    eventId: string,
    userId: string
  ): void;
  /**
   *
   * @fires STORAGE:SET_WEEK_TASK_ACTIVITY_ERROR
   */
  setWeekTaskActivity(options: {
    familyId: string;
    weekId: string;
    todoId: string;
    userId: string;
    weekdayIndex: number;
    active: boolean;
  }): void;
  /**
   *
   * @fires STORAGE:BARCODES_UPDATE
   * @fires STORAGE:LINK_BARCODE_ERROR
   */
  linkBarcode(familyId: string, barcodeId: string, groceryId: string): void;
  /**
   *
   * @fires STORAGE:BARCODES_UPDATE
   * @fires STORAGE:UNLINK_BARCODE_ERROR
   */
  unlinkBarcode(familyId: string, barcodeId: string): void;
}
