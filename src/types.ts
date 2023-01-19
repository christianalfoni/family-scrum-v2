export type FamilyUserDTO = {
  id: string;
  familyId: string;
};

export type UserDTO = {
  id: string;
};

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
  grocery?: string;
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
