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

export type CheckListItemsByTodoId = {
  [todoId: string]: {
    [itemId: string]: CheckListItemDTO;
  };
};

export type DinnerDTO = {
  id: string;
  name: string;
  description: string;
  preparationCheckList: string[];
  groceries: string[];
  instructions: string[];
  created: number;
  modified: number;
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

export type WeekDinnersDTO = [
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null
];

export type WeekDTO = {
  // Week id is the date of each Monday (YYYYMMDD)
  id: string;
  todos: {
    [todoId: string]: {
      [userId: string]: WeekTodoActivity;
    };
  };
  dinners: WeekDinnersDTO;
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
      type: "STORAGE:STORE_DINNER_ERROR";
      dinner: DinnerDTO;
    }
  | {
      type: "STORAGE:STORE_TODO_SUCCESS";
      id: string;
    }
  | {
      type: "STORAGE:STORE_TODO_ERROR";
      todo: TodoDTO;
    }
  | {
      type: "STORAGE:GROCERIES_UPDATE";
      groceries: {
        [groceryId: string]: GroceryDTO;
      };
    }
  | {
      type: "STORAGE:STORE_GROCERY_SUCCESS";
      id: string;
    }
  | {
      type: "STORAGE:STORE_GROCERY_ERROR";
      grocery: GroceryDTO;
    }
  | {
      type: "STORAGE:DELETE_GROCERY_ERROR";
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
      checkListItemsByTodoId: CheckListItemsByTodoId;
    };

export interface Storage {
  createDinnerId(): string;
  createTodoId(): string;
  createCheckListItemId(): string;
  createGroceryId(): string;
  configureFamilyCollection(familyId: string): void;
  storeDinner(
    dinner: Pick<
      DinnerDTO,
      | "id"
      | "description"
      | "groceries"
      | "instructions"
      | "name"
      | "preparationCheckList"
    >
  ): void;
  deleteDinner(id: string): void;
  fetchFamilyData(): void;
  fetchWeeks(userId: string): void;
  storeGrocery(grocery: Pick<GroceryDTO, "id" | "name" | "dinnerId">): void;
  storeTodo(
    todo: Pick<TodoDTO, "description" | "date" | "id" | "time">,
    checkList?: Pick<CheckListItemDTO, "id" | "title">[]
  ): void;
  deleteGrocery(id: string): void;
  archiveTodo(id: string): void;
  setWeekTaskActivity(options: {
    weekId: string;
    todoId: string;
    userId: string;
    weekdayIndex: number;
    active: boolean;
  }): void;
  setWeekDinner(options: {
    weekId: string;
    dinnerId: string | null;
    weekdayIndex: number;
  }): void;
  toggleCheckListItem(userId: string, itemId: string): void;
  deleteChecklistItem(id: string): void;
  storeChecklistItem(
    checkListItem: Pick<CheckListItemDTO, "id" | "title" | "todoId">
  ): void;
}
