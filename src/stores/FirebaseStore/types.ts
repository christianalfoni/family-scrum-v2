export type UserDTO = {
  id: string;
  familyId: string;
};

export type GroceryDTO = {
  id: string;
  dinnerId?: string;
  created: number;
  modified: number;
  name: string;
};
