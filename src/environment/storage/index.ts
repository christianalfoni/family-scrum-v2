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

export type TodoDTO = {
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
      groceries: GroceryDTO[];
      todos: {
        [todoId: string]: TodoDTO;
      };
      events: {
        [eventId: string]: CalendarEventDTO;
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
      type: "STORAGE:EVENTS_UPDATE";
      events: {
        [eventId: string]: CalendarEventDTO;
      };
    }
  | {
      type: "STORAGE:ADD_EVENT_ERROR";
      error: string;
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
    }
  | {
      type: "STORAGE:FETCH_WEEKS_ERROR";
      error: string;
    }
  | {
      type: "STORAGE:CURRENT_WEEK_TODO_ACTIVITY_UPDATE";
      todoId: string;
      userId: string;
      activity: WeekTodoActivity;
    }
  | {
      type: "STORAGE:NEXT_WEEK_TODO_ACTIVITY_UPDATE";
      todoId: string;
      userId: string;
      activity: WeekTodoActivity;
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
      type: "STORAGE:ARCHIVE_TODO_ERROR";
      id: string;
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
   * @fires STORAGE:FETCH_FAMILY_DATA_SUCCESS
   * @fires STORAGE:FETCH_FAMILY_DATA_ERROR
   */
  fetchFamilyData(familyId: string): void;
  /**
   *
   * @fires STORAGE:WEEKS_UPDATE
   * @fires STORAGE:CURRENT_WEEK_TODO_ACTIVITY_UPDATE
   * @fires STORAGE:NEXT_WEEK_TODO_ACTIVITY_UPDATE
   * @fires STORAGE:FETCH_WEEKS_ERROR
   */
  fetchWeeks(familyId: string): void;
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
  deleteGrocery(familyId: string, id: string): void;
  increaseGroceryShopCount(familyId: string, id: string): void;
  resetGroceryShopCount(familyId: string, id: string): void;
  archiveTodo(familyId: string, id: string): void;
  /**
   *
   * @fires STORAGE:EVENTS_UPDATE
   */
  archiveEvent(familyId: string, id: string): void;
  /**
   *
   * @fires STORAGE:EVENTS_UPDATE
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
}
