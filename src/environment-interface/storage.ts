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
  instructions: string[];
};

export type GroceryDTO = {
  id: string;
  dinnerId?: string;
  created: number;
  modified: number;
  name: string;
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
  fetchFamilyData(familyId: string): void;
  fetchWeeks(familyId: string, userId: string): void;
  addGrocery(familyId: string, name: string): void;
  addTodo(
    familyId: string,
    description: string,
    metadata?: {
      date?: number;
      time?: string;
      checkList?: string[];
    }
  ): void;
  deleteGrocery(familyId: string, id: string): void;
  archiveTodo(familyId: string, id: string): void;
  setWeekTaskActivity(options: {
    familyId: string;
    weekId: string;
    todoId: string;
    userId: string;
    weekdayIndex: number;
    active: boolean;
  }): void;
  toggleCheckListItem(familyId: string, userId: string, itemId: string): void;
  deleteChecklistItem(familyId: string, itemId: string): void;
  addChecklistItem(familyId: string, todoId: string, title: string): void;
}
