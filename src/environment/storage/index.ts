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

export type CheckListItemDTO = {
  id: string;
  todoId: string;
  title: string;
  created: number;
  modified: number;
} & (
  | {
      completed: false;
    }
  | {
      completed: true;
      completedByUserId: string;
    }
);

export type DinnerDTO = {
  id: string;
  name: string;
  description: string;
  preparationCheckList: string[];
  groceries: Array<{
    id: string;
    shopCount: number;
  }>;
  directions: string[];
};

export type BarcodeDTO = {
  id: string;
  created: number;
  modified: number;
  groceryId: string | null;
};

export type GroceryDTO = {
  id: string;
  dinnerId?: string;
  created: number;
  modified: number;
  name: string;
  shopCount: number;
  image?: string;
  shopHistory?: {
    [shoppingListSize: string]: number;
  };
};

export type TodoDTO = {
  id: string;
  created: number;
  modified: number;
  description: string;
  date?: number;
  time?: string;
  checkList?: boolean;
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
      type: "STORAGE:FAMILY_UPDATE";
      family: FamilyDTO;
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
        [barcodeId: string]: BarcodeDTO;
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
      type: "STORAGE:TODOS_UPDATE";
      todos: {
        [todoId: string]: TodoDTO;
      };
    }
  | {
      type: "STORAGE:DINNERS_UPDATE";
      dinners: {
        [dinnerId: string]: DinnerDTO;
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
      type: "STORAGE:SHOP_GROCERY_ERROR";
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
      type: "STORAGE:SET_WEEK_TODO_ACTIVITY_ERROR";
      weekId: string;
      todoId: string;
      userId: string;
      error: string;
    }
  | {
      type: "STORAGE:ADD_IMAGE_TO_GROCERY_ERROR";
      groceryId: string;
      error: string;
    }
  | {
      type: "STORAGE:TOGGLE_CHECKLIST_ITEM_ERROR";
      itemId: string;
      error: string;
    }
  | {
      type: "STORAGE:DELETE_CHECKLIST_ITEM_ERROR";
      itemId: string;
      error: string;
    }
  | {
      type: "STORAGE:ADD_CHECKLIST_ITEM_ERROR";
      title: string;
      todoId: string;
      error: string;
    }
  | {
      type: "STORAGE:CHECKLIST_ITEMS_UPDATE";
      checkListItemsByTodoId: {
        [todoId: string]: {
          [itemId: string]: CheckListItemDTO;
        };
      };
    };

export interface Storage {
  events: Events<StorageEvent>;
  /**
   *
   * @fires STORAGE:GROCERIES_UPDATE
   * @fires STORAGE:TODOS_UPDATE
   * @fires STORAGE:BARCODES_UPDATE
   * @fires STORAGE:CHECKLIST_ITEMS_UPDATE
   * @fires STORAGE:DINNERS_UPDATE
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
  addGrocery(familyId: string, name: string): void;
  /**
   *
   * @fires STORAGE:TODOS_UPDATE
   * @fires STORAGE:ADD_TODO_ERROR
   */
  addTodo(
    familyId: string,
    description: string,
    metadata?: {
      date?: number;
      time?: string;
      checkList?: string[];
    }
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
   * @fires STORAGE:SHOP_GROCERY_ERROR
   */
  shopGrocery(familyId: string, id: string, shoppingListLength: number): void;
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
  /**
   * @fires STORAGE:GROCERIES_UPDATE
   * @fires STORAGE:ADD_IMAGE_TO_GROCERY_ERROR
   */
  addImageToGrocery(familyId: string, groceryId: string, src: string): void;
  /**
   * @fires STORAGE:TODOS_UPDATE
   * @fires STORAGE:TOGGLE_CHECKLIST_ITEM_ERROR
   */
  toggleCheckListItem(familyId: string, userId: string, itemId: string): void;
  /**
   * @fires STORAGE:TODOS_UPDATE
   * @fires STORAGE:DELETE_CHECKLIST_ITEM_ERROR
   */
  deleteChecklistItem(familyId: string, itemId: string): void;
  /**
   * @fires STORAGE:TODOS_UPDATE
   * @fires STORAGE:ADD_CHECKLIST_ITEM_ERROR
   */
  addChecklistItem(familyId: string, todoId: string, title: string): void;
}
