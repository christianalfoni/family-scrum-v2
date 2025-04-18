export type UserDTO = {
  id: string;
  familyId: string;
};

export type GroceryDTO = {
  id: string;
  dinnerId?: string;
  created: Date;
  modified: Date;
  name: string;
};

export type CheckListItemDTO = {
  title: string;
} & (
  | {
      completed: false;
    }
  | {
      completed: true;
      completedByUserId: string;
    }
);

export type TodoDTO = {
  id: string;
  created: Date;
  modified: Date;
  description: string;
  date?: Date;
  time?: string;
  checkList?: CheckListItemDTO[];
  grocery?: string;
};

export type TodoDTOWithDate = Omit<TodoDTO, "date"> & { date: Date };

// Each user has an array representing each day of the week,
// which holds a boolean if the todo is active or not
export type WeekTodoActivityDTO = [
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
  id: string;
  dinners: WeekDinnersDTO;
};

export type WeekTodoDTO = {
  id: string;
  activityByUserId: {
    [userId: string]: WeekTodoActivityDTO;
  };
};

export type DinnerDTO = {
  id: string;
  name: string;
  description: string;
  preparationCheckList: string[];
  imageRef?: string;
  groceries: string[];
  instructions: string[];
  created: Date;
  modified: Date;
};

export type FamilyUserDTO = {
  name: string;
  avatar: string;
};

export type FamilyDTO = {
  id: string;
  users: {
    [id: string]: FamilyUserDTO;
  };
};
