import { createContext, useContext, useMemo } from "react";
import {
  DinnerDTO,
  FamilyDTO,
  FamilyUserDTO,
  TodoDTO,
  UserDTO,
  WeekTodoDTO,
} from "../../environments/Browser/Persistence";
import { Groceries, useGroceries } from "./useGroceries";
import { Todos, useTodos } from "./useTodos";
import { Dinners, useDinners } from "./useDinners";
import { Weeks, useWeeks } from "./useWeeks";
import { Awake, useAwake } from "./useAwake";
import { getWeekDayIndex, isWithinWeek } from "../../utils";

export type FamilyScrum = {
  user: UserDTO;
  family: FamilyDTO;
  groceries: Groceries;
  todos: Todos;
  dinners: Dinners;
  weeks: Weeks;
  awake: Awake;
};

const FamilyScrumContext = createContext(null as unknown as FamilyScrum);

export function useFamilyScrum() {
  return useContext(FamilyScrumContext);
}

type Props = {
  user: UserDTO;
  family: FamilyDTO;
  children: React.ReactNode;
};

export function FamilyScrumProvider({ user, family, children }: Props) {
  const groceries = useGroceries(family.id);
  const todos = useTodos({ familyId: family.id, userId: user.id });
  const dinners = useDinners(family.id);
  const weeks = useWeeks(family.id);
  const awake = useAwake();

  return (
    <FamilyScrumContext.Provider
      value={{
        user,
        family,
        groceries,
        dinners,
        todos,
        weeks,
        awake,
      }}
    >
      {children}
    </FamilyScrumContext.Provider>
  );
}
